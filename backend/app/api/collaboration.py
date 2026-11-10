from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Workspace, Discussion, ResearchProject, ProjectTask, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/collaboration", tags=["Collaboration Workspaces & Projects"])

class ProjectCreateSchema(BaseModel):
    title: str
    description: str = None
    organization_name: str = None
    budget: float = 0.0
    start_date: str = None
    end_date: str = None

class TaskCreateSchema(BaseModel):
    title: str
    assignee_name: str = None
    due_date: str = None

class DiscussionCreateSchema(BaseModel):
    title: str
    content: str

@router.get("/workspaces")
def list_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "description": w.description,
            "is_private": w.is_private,
            "created_at": w.created_at.isoformat() if w.created_at else None,
            "discussion_count": len(w.discussions)
        }
        for w in workspaces
    ]

@router.get("/workspaces/{ws_id}")
def get_workspace_detail(ws_id: int, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    discussions = [
        {
            "id": d.id,
            "user_name": d.user_name,
            "title": d.title,
            "content": d.content,
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in ws.discussions
    ]

    return {
        "id": ws.id,
        "name": ws.name,
        "description": ws.description,
        "is_private": ws.is_private,
        "created_at": ws.created_at.isoformat() if ws.created_at else None,
        "discussions": discussions
    }

@router.post("/workspaces/{ws_id}/discussions")
def add_discussion(
    ws_id: int,
    data: DiscussionCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    disc = Discussion(
        workspace_id=ws.id,
        user_name=current_user.full_name,
        title=data.title,
        content=data.content
    )
    db.add(disc)
    db.commit()
    db.refresh(disc)

    return {"message": "Discussion topic added.", "discussion_id": disc.id}

@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(ResearchProject).order_by(ResearchProject.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "organization_name": p.organization_name,
            "status": p.status,
            "budget": p.budget,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "task_count": len(p.tasks),
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in projects
    ]

@router.post("/projects")
def create_project(
    data: ProjectCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = ResearchProject(
        title=data.title,
        description=data.description,
        organization_name=data.organization_name or (current_user.organization.name if current_user.organization else "Research Org"),
        budget=data.budget,
        start_date=data.start_date,
        end_date=data.end_date,
        created_by=current_user.id
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="CREATE",
        entity_type="ResearchProject",
        entity_id=str(p.id),
        new_value=f"Created research project '{p.title}'"
    )
    db.add(log)
    db.commit()

    return {
        "message": "Research project successfully created and persisted.",
        "project_id": p.id,
        "title": p.title
    }

@router.post("/projects/{proj_id}/tasks")
def add_project_task(
    proj_id: int,
    data: TaskCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = db.query(ResearchProject).filter(ResearchProject.id == proj_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    task = ProjectTask(
        project_id=p.id,
        title=data.title,
        status="PENDING",
        assignee_name=data.assignee_name or current_user.full_name,
        due_date=data.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {"message": "Task added to research project.", "task_id": task.id}
