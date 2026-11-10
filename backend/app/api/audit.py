from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    entity_type: str = None,
    action: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user_name,
            "user_role": log.user_role,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "ip_address": log.ip_address
        }
        for log in logs
    ]

@router.get("/stats")
def get_audit_stats(db: Session = Depends(get_db)):
    total_logs = db.query(AuditLog).count()
    creates = db.query(AuditLog).filter(AuditLog.action == "CREATE").count()
    updates = db.query(AuditLog).filter(AuditLog.action == "UPDATE").count()
    deletes = db.query(AuditLog).filter(AuditLog.action == "DELETE").count()
    executes = db.query(AuditLog).filter(AuditLog.action == "EXECUTE").count()

    return {
        "total_actions": total_logs,
        "creates": creates,
        "updates": updates,
        "deletes": deletes,
        "executes": executes
    }
