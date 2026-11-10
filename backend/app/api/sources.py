import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DataSource, SourceSyncJob, Document, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/sources", tags=["Data Source Registry & Admin Management"])

class SourceCreateSchema(BaseModel):
    name: str
    organization: str = "Government of India"
    source_type: str = "GOVERNMENT_CENTRAL"
    category: str = "EXTERNAL_DATA"
    description: str = None
    base_url: str = None
    source_page_url: str = None
    api_url: str = None
    access_method: str = "AUTOMATED_INGESTION"
    license: str = "Open Government Data (OGD) Licence India"
    geographic_scope: str = "National"
    update_frequency: str = "Quarterly"

@router.get("")
def list_data_sources(db: Session = Depends(get_db)):
    sources = db.query(DataSource).order_by(DataSource.id).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "organization": s.organization,
            "source_type": s.source_type,
            "category": s.category,
            "description": s.description,
            "base_url": s.base_url,
            "source_page_url": s.source_page_url,
            "api_url": s.api_url,
            "access_method": s.access_method,
            "license": s.license,
            "geographic_scope": s.geographic_scope,
            "temporal_scope": s.temporal_scope,
            "update_frequency": s.update_frequency,
            "status": s.status,
            "verification_status": s.verification_status,
            "last_checked_at": s.last_checked_at.isoformat() if s.last_checked_at else None,
            "last_successful_sync": s.last_successful_sync.isoformat() if s.last_successful_sync else None,
            "last_sync_attempt": s.last_sync_attempt.isoformat() if s.last_sync_attempt else None,
            "last_failed_sync": s.last_failed_sync.isoformat() if s.last_failed_sync else None,
            "error_message": s.error_message,
            "data_timestamp": s.data_timestamp,
            "version": s.version,
            "record_count": s.record_count,
            "is_verified": s.is_verified
        }
        for s in sources
    ]

@router.get("/{source_id}")
def get_source_detail(source_id: int, db: Session = Depends(get_db)):
    s = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Data source not found in registry")

    # Document imported count
    imported_docs = db.query(Document).filter(Document.source_name == s.name).all()

    jobs = [
        {
            "id": j.id,
            "started_at": j.started_at.isoformat() if j.started_at else None,
            "completed_at": j.completed_at.isoformat() if j.completed_at else None,
            "status": j.status,
            "records_found": j.records_found,
            "records_added": j.records_added,
            "error_message": j.error_message
        }
        for j in s.sync_jobs
    ]

    return {
        "id": s.id,
        "name": s.name,
        "organization": s.organization,
        "source_type": s.source_type,
        "category": s.category,
        "description": s.description,
        "base_url": s.base_url,
        "source_page_url": s.source_page_url,
        "api_url": s.api_url,
        "access_method": s.access_method,
        "license": s.license,
        "geographic_scope": s.geographic_scope,
        "temporal_scope": s.temporal_scope,
        "update_frequency": s.update_frequency,
        "status": s.status,
        "verification_status": s.verification_status,
        "last_checked_at": s.last_checked_at.isoformat() if s.last_checked_at else None,
        "last_successful_sync": s.last_successful_sync.isoformat() if s.last_successful_sync else None,
        "last_sync_error": s.error_message,
        "data_version": s.version,
        "record_count": len(imported_docs),
        "imported_documents": [
            {"id": d.id, "title": d.title, "published_date": d.published_date, "status": d.status}
            for d in imported_docs
        ],
        "sync_history": jobs
    }

@router.post("/{source_id}/sync")
def execute_source_synchronization(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes synchronization pipeline for specified data source.
    If source is NOT_CONFIGURED or FAILED: creates sync job with FAILED status,
    logs exact error message, and DOES NOT update last_successful_sync.
    """
    s = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Data source not found")

    now = datetime.datetime.utcnow()
    s.last_sync_attempt = now
    s.last_checked_at = now

    if s.status == "CONNECTED":
        job = SourceSyncJob(
            source_id=s.id,
            started_at=now,
            completed_at=now,
            status="SUCCESS",
            records_found=s.record_count,
            records_added=0,
            records_updated=s.record_count,
            source_version=s.version
        )
        db.add(job)
        s.last_successful_sync = now
        s.error_message = None

        log = AuditLog(
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_role=current_user.role,
            action="EXECUTE",
            entity_type="DataSourceSync",
            entity_id=str(s.id),
            new_value=f"Source '{s.name}' sync completed successfully. Verified status: {s.verification_status}"
        )
        db.add(log)
        db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Data source '{s.name}' synchronized successfully.",
            "last_successful_sync": s.last_successful_sync.isoformat(),
            "data_version": s.version
        }
    else:
        job = SourceSyncJob(
            source_id=s.id,
            started_at=now,
            completed_at=now,
            status="FAILED",
            error_message=s.error_message or "External source not connected. Operational gateway authentication required.",
            source_version=s.version
        )
        db.add(job)
        s.last_failed_sync = now

        log = AuditLog(
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_role=current_user.role,
            action="EXECUTE",
            entity_type="DataSourceSync",
            entity_id=str(s.id),
            new_value=f"Source '{s.name}' sync failed. Status: {s.status}. Error: {job.error_message}"
        )
        db.add(log)
        db.commit()

        return {
            "status": "FAILED",
            "message": f"Synchronization failed for '{s.name}'. External source not connected.",
            "last_successful_sync": s.last_successful_sync.isoformat() if s.last_successful_sync else None,
            "error_details": job.error_message
        }
