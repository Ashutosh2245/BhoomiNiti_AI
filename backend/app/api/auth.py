from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Organization, AuditLog
from app.core.security import verify_password, create_access_token
from app.core.rbac import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchRoleRequest(BaseModel):
    target_role: str

class PreferencesRequest(BaseModel):
    role: str = None
    interests: list[str] = []
    preferred_language: str = "en-hi"

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    
    # Audit log
    log = AuditLog(
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role,
        action="LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        new_value=f"User logged in as {user.role}"
    )
    db.add(log)
    db.commit()

    import json
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization": user.organization.name if user.organization else "Independent",
            "interests": json.loads(user.interests) if user.interests else [],
            "preferred_language": user.preferred_language or "en-hi"
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    import json
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "organization": current_user.organization.name if current_user.organization else "Independent",
        "interests": json.loads(current_user.interests) if current_user.interests else [],
        "preferred_language": current_user.preferred_language or "en-hi"
    }

@router.post("/preferences")
def save_user_preferences(
    req: PreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import json
    if req.role:
        current_user.role = req.role
    if req.interests:
        current_user.interests = json.dumps(req.interests)
    if req.preferred_language:
        current_user.preferred_language = req.preferred_language
    
    db.commit()
    db.refresh(current_user)

    return {
        "status": "SUCCESS",
        "message": "User onboarding preferences updated successfully.",
        "user": {
            "id": current_user.id,
            "role": current_user.role,
            "interests": json.loads(current_user.interests) if current_user.interests else [],
            "preferred_language": current_user.preferred_language
        }
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "organization": u.organization.name if u.organization else "Independent"
        }
        for u in users
    ]

@router.post("/switch-role")
def switch_role(req: SwitchRoleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    valid_roles = ["super_admin", "govt_official", "researcher", "academic", "think_tank", "gis_expert", "innovation_partner", "public_user"]
    if req.target_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    old_role = current_user.role
    current_user.role = req.target_role
    
    # Create audit log for role switch
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=req.target_role,
        action="SWITCH_ROLE",
        entity_type="User",
        entity_id=str(current_user.id),
        old_value=f"Role: {old_role}",
        new_value=f"Role: {req.target_role}"
    )
    db.add(log)
    db.commit()
    db.refresh(current_user)

    new_token = create_access_token({"sub": current_user.email, "role": current_user.role, "id": current_user.id})

    return {
        "message": f"Successfully switched active session role to {req.target_role}",
        "access_token": new_token,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "organization": current_user.organization.name if current_user.organization else "Independent"
        }
    }

