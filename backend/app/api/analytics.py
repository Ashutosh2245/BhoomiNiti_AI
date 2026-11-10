from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Indicators"])

class IndicatorUpdateSchema(BaseModel):
    name: str = None
    description: str = None
    formula: str = None
    unit: str = None
    baseline_val: float = None
    target_val: float = None
    current_val: float = None
    status: str = None

@router.get("/indicators")
def list_indicators(db: Session = Depends(get_db)):
    indicators = db.query(Indicator).order_by(Indicator.code).all()
    return [
        {
            "id": ind.id,
            "code": ind.code,
            "name": ind.name,
            "description": ind.description,
            "formula": ind.formula,
            "data_source": ind.data_source,
            "unit": ind.unit,
            "frequency": ind.frequency,
            "baseline_val": ind.baseline_val,
            "target_val": ind.target_val,
            "current_val": ind.current_val,
            "owner": ind.owner,
            "status": ind.status,
            "version": ind.version,
            "updated_at": ind.updated_at.isoformat() if ind.updated_at else None
        }
        for ind in indicators
    ]

@router.get("/indicators/{ind_id}")
def get_indicator(ind_id: int, db: Session = Depends(get_db)):
    ind = db.query(Indicator).filter(Indicator.id == ind_id).first()
    if not ind:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return {
        "id": ind.id,
        "code": ind.code,
        "name": ind.name,
        "description": ind.description,
        "formula": ind.formula,
        "data_source": ind.data_source,
        "unit": ind.unit,
        "frequency": ind.frequency,
        "baseline_val": ind.baseline_val,
        "target_val": ind.target_val,
        "current_val": ind.current_val,
        "owner": ind.owner,
        "status": ind.status,
        "version": ind.version,
        "updated_at": ind.updated_at.isoformat() if ind.updated_at else None
    }

@router.put("/indicators/{ind_id}")
def update_indicator(
    ind_id: int,
    data: IndicatorUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ind = db.query(Indicator).filter(Indicator.id == ind_id).first()
    if not ind:
        raise HTTPException(status_code=404, detail="Indicator not found")

    old_vals = f"Name: '{ind.name}', Formula: '{ind.formula}', Current: {ind.current_val}, Target: {ind.target_val}"

    if data.name is not None:
        ind.name = data.name
    if data.description is not None:
        ind.description = data.description
    if data.formula is not None:
        ind.formula = data.formula
    if data.unit is not None:
        ind.unit = data.unit
    if data.baseline_val is not None:
        ind.baseline_val = data.baseline_val
    if data.target_val is not None:
        ind.target_val = data.target_val
    if data.current_val is not None:
        ind.current_val = data.current_val
    if data.status is not None:
        ind.status = data.status

    ind.version += 1
    
    new_vals = f"Name: '{ind.name}', Formula: '{ind.formula}', Current: {ind.current_val}, Target: {ind.target_val} (v{ind.version})"

    # Record Audit Log
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="UPDATE",
        entity_type="Indicator",
        entity_id=str(ind.id),
        old_value=old_vals,
        new_value=new_vals
    )
    db.add(log)
    db.commit()
    db.refresh(ind)

    return {
        "message": "Indicator configuration successfully updated and persisted in database.",
        "indicator": {
            "id": ind.id,
            "code": ind.code,
            "name": ind.name,
            "description": ind.description,
            "formula": ind.formula,
            "unit": ind.unit,
            "baseline_val": ind.baseline_val,
            "target_val": ind.target_val,
            "current_val": ind.current_val,
            "version": ind.version,
            "updated_at": ind.updated_at.isoformat() if ind.updated_at else None
        }
    }

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    return {
        "land_use_trends": [
            {"year": "2019", "agricultural": 58.4, "urban_builtup": 12.1, "forest": 21.3, "water": 8.2},
            {"year": "2020", "agricultural": 57.8, "urban_builtup": 13.0, "forest": 21.2, "water": 8.0},
            {"year": "2021", "agricultural": 57.1, "urban_builtup": 13.9, "forest": 21.1, "water": 7.9},
            {"year": "2022", "agricultural": 56.5, "urban_builtup": 14.8, "forest": 21.0, "water": 7.7},
            {"year": "2023", "agricultural": 55.8, "urban_builtup": 15.6, "forest": 21.0, "water": 7.6},
            {"year": "2024", "agricultural": 55.1, "urban_builtup": 16.5, "forest": 20.9, "water": 7.5}
        ],
        "dispute_settlement_duration": [
            {"state": "Maharashtra", "months": 14.2, "resolved_pct": 84.5},
            {"state": "Karnataka", "months": 16.8, "resolved_pct": 79.2},
            {"state": "Odisha", "months": 11.5, "resolved_pct": 89.1},
            {"state": "Uttar Pradesh", "months": 18.4, "resolved_pct": 76.0},
            {"state": "Telangana", "months": 12.1, "resolved_pct": 87.3}
        ],
        "digitization_progress": [
            {"quarter": "Q1 2023", "parcels_digitized": 68.2},
            {"quarter": "Q2 2023", "parcels_digitized": 73.5},
            {"quarter": "Q3 2023", "parcels_digitized": 79.1},
            {"quarter": "Q4 2023", "parcels_digitized": 84.0},
            {"quarter": "Q1 2024", "parcels_digitized": 87.6},
            {"quarter": "Q2 2024", "parcels_digitized": 89.4}
        ]
    }
