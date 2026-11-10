import os
import hashlib
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, DocumentVersion, DocumentMetadata, Dataset, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/documents", tags=["Knowledge Repository"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DocumentCreateSchema(BaseModel):
    title: str
    doc_type: str
    category: str = None
    author: str = None
    publication_year: int = 2024
    state: str = None
    district: str = None
    access_level: str = "PUBLIC"
    summary: str = None
    content_text: str = None
    tags: str = None
    abstract: str = None
    key_findings: str = None
    methodology: str = None

@router.get("")
def list_documents(
    doc_type: str = Query(None),
    state: str = Query(None),
    district: str = Query(None),
    year: int = Query(None),
    category: str = Query(None),
    search: str = Query(None),
    access_level: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document)

    # RBAC access level restriction
    if current_user.role in ["public_user", "innovation_partner"]:
        query = query.filter(Document.access_level == "PUBLIC")

    if doc_type:
        query = query.filter(Document.doc_type == doc_type)
    if state:
        query = query.filter(Document.state == state)
    if district:
        query = query.filter(Document.district == district)
    if year:
        query = query.filter(Document.publication_year == year)
    if category:
        query = query.filter(Document.category == category)
    if access_level:
        query = query.filter(Document.access_level == access_level)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Document.title.ilike(search_pattern)) |
            (Document.summary.ilike(search_pattern)) |
            (Document.tags.ilike(search_pattern)) |
            (Document.author.ilike(search_pattern))
        )

    docs = query.order_by(Document.updated_at.desc()).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type,
            "category": d.category,
            "author": d.author,
            "organization_name": d.organization_name,
            "publication_year": d.publication_year,
            "state": d.state,
            "district": d.district,
            "access_level": d.access_level,
            "summary": d.summary,
            "tags": d.tags.split(",") if d.tags else [],
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "version_count": len(d.versions)
        }
        for d in docs
    ]

@router.get("/{doc_id}")
def get_document_detail(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Document).filter(Document.id == doc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")

    if d.access_level != "PUBLIC" and current_user.role in ["public_user", "innovation_partner"]:
        raise HTTPException(status_code=403, detail="Access denied to restricted government document")

    meta = d.metadata_rel
    return {
        "id": d.id,
        "title": d.title,
        "doc_type": d.doc_type,
        "category": d.category,
        "author": d.author,
        "organization_name": d.organization_name,
        "publication_year": d.publication_year,
        "state": d.state,
        "district": d.district,
        "access_level": d.access_level,
        "summary": d.summary,
        "content_text": d.content_text,
        "tags": d.tags.split(",") if d.tags else [],
        "file_path": d.file_path,
        "mime_type": d.mime_type,
        "file_size": d.file_size,
        "metadata": {
            "abstract": meta.abstract if meta else None,
            "key_findings": meta.key_findings if meta else None,
            "methodology": meta.methodology if meta else None,
            "related_policies": meta.related_policies if meta else None,
            "keywords": meta.keywords if meta else None,
            "citations_text": meta.citations_text if meta else None
        },
        "versions": [
            {
                "version_number": v.version_number,
                "change_summary": v.change_summary,
                "file_hash": v.file_hash,
                "uploaded_at": v.uploaded_at.isoformat() if v.uploaded_at else None
            }
            for v in d.versions
        ],
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "ai_disclaimer": "AI-generated summary based strictly on indexed source document content."
    }

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    doc_type: str = Form(...),
    category: str = Form(None),
    author: str = Form(None),
    organization_name: str = Form(None),
    publication_year: int = Form(2024),
    state: str = Form(None),
    district: str = Form(None),
    access_level: str = Form("PUBLIC"),
    tags: str = Form(None),
    abstract: str = Form(None),
    key_findings: str = Form(None),
    methodology: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_path = None
    file_hash = None
    file_size = 0

    if file:
        content = await file.read()
        file_size = len(content)
        file_hash = hashlib.sha256(content).hexdigest()
        filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        saved_path = os.path.join("uploads", filename)
        abs_saved_path = os.path.join(UPLOAD_DIR, filename)
        with open(abs_saved_path, "wb") as f:
            f.write(content)

    doc = Document(
        title=title,
        doc_type=doc_type,
        category=category or "General",
        author=author or current_user.full_name,
        organization_name=organization_name or (current_user.organization.name if current_user.organization else "BhoomiNiti Network"),
        publication_year=publication_year,
        state=state,
        district=district,
        access_level=access_level,
        file_path=saved_path,
        file_hash=file_hash,
        file_size=file_size,
        mime_type=file.content_type if file else "application/pdf",
        summary=abstract or f"Uploaded document: {title}",
        content_text=f"{title}\n\nAbstract:\n{abstract}\n\nKey Findings:\n{key_findings}\n\nMethodology:\n{methodology}",
        tags=tags,
        created_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Document version 1
    version = DocumentVersion(
        document_id=doc.id,
        version_number=1,
        file_path=saved_path or "manual_entry",
        file_hash=file_hash or "manual_entry_hash",
        change_summary="Initial document upload and indexing.",
        uploaded_by=current_user.id
    )
    db.add(version)

    # Metadata
    meta = DocumentMetadata(
        document_id=doc.id,
        abstract=abstract,
        key_findings=key_findings,
        methodology=methodology,
        keywords=tags,
        citations_text=f"{author or 'Unknown'}. ({publication_year}). '{title}'."
    )
    db.add(meta)

    # Audit Log
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="CREATE",
        entity_type="Document",
        entity_id=str(doc.id),
        new_value=f"Uploaded document '{title}' (Type: {doc_type}, Access: {access_level})"
    )
    db.add(log)
    db.commit()

    return {
        "message": "Document successfully uploaded, processed, and persisted in database.",
        "document_id": doc.id,
        "title": doc.title
    }

@router.post("/{doc_id}/save")
def save_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Persists saved document relationship for user in DB (`saved_documents` table).
    Survives page refresh, logout/login, and browser restart.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    from app.models import SavedDocument
    existing = db.query(SavedDocument).filter(
        SavedDocument.user_id == current_user.id,
        SavedDocument.document_id == doc_id
    ).first()

    if not existing:
        saved = SavedDocument(user_id=current_user.id, document_id=doc_id)
        db.add(saved)
        db.commit()

    return {"message": "Document successfully saved to user repository in database.", "document_id": doc_id}

@router.patch("/{doc_id}/status")
def update_document_status(
    doc_id: int,
    status: str = Query(...), # PUBLISHED, DRAFT, ARCHIVED, UNPUBLISHED
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates document publishing status. Archiving/unpublishing automatically removes it
    from the homepage recent research API queries.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    old_status = doc.status
    doc.status = status

    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="UPDATE",
        entity_type="DocumentStatus",
        entity_id=str(doc.id),
        old_value=f"Status: {old_status}",
        new_value=f"Status: {status}"
    )
    db.add(log)
    db.commit()

    return {"message": f"Document status updated to '{status}'.", "document_id": doc_id, "status": status}


# Datasets API router inside Knowledge
dataset_router = APIRouter(prefix="/datasets", tags=["Dataset Catalog"])

@dataset_router.get("")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).all()
    return [
        {
            "id": ds.id,
            "title": ds.title,
            "category": ds.category,
            "format": ds.format,
            "spatial_coverage": ds.spatial_coverage,
            "temporal_coverage": ds.temporal_coverage,
            "access_level": ds.access_level,
            "quality_score": ds.quality_score,
            "row_count": ds.row_count,
            "created_at": ds.created_at.isoformat() if ds.created_at else None
        }
        for ds in datasets
    ]
