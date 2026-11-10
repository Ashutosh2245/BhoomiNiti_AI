from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import InnovationChallenge, ChallengeSubmission, GrantPilot, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/innovation", tags=["Innovation Hub"])

class SubmissionCreateSchema(BaseModel):
    team_name: str
    title: str
    proposal_text: str

@router.get("/challenges")
def list_challenges(db: Session = Depends(get_db)):
    challenges = db.query(InnovationChallenge).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "problem_statement": c.problem_statement,
            "eligibility": c.eligibility,
            "reward_pool": c.reward_pool,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "status": c.status,
            "submission_count": len(c.submissions)
        }
        for c in challenges
    ]

@router.post("/challenges/{challenge_id}/submit")
def submit_to_challenge(
    challenge_id: int,
    data: SubmissionCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(InnovationChallenge).filter(InnovationChallenge.id == challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    sub = ChallengeSubmission(
        challenge_id=c.id,
        team_name=data.team_name,
        title=data.title,
        proposal_text=data.proposal_text,
        status="SUBMITTED",
        submitted_by=current_user.full_name
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="CREATE",
        entity_type="ChallengeSubmission",
        entity_id=str(sub.id),
        new_value=f"Submitted proposal '{sub.title}' for Challenge #{c.id}"
    )
    db.add(log)
    db.commit()

    return {"message": "Proposal successfully submitted to Innovation Challenge.", "submission_id": sub.id}

@router.get("/grants-pilots")
def list_grants_pilots(db: Session = Depends(get_db)):
    items = db.query(GrantPilot).all()
    return [
        {
            "id": item.id,
            "type": item.type,
            "title": item.title,
            "organization_name": item.organization_name,
            "amount": item.amount,
            "status": item.status,
            "timeline": item.timeline,
            "impact_summary": item.impact_summary
        }
        for item in items
    ]
