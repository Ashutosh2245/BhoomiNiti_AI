import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SimulationScenario, SimulationRun, AuditLog, User
from app.core.rbac import get_current_user
from app.simulations.simulator_engine import execute_policy_simulation

router = APIRouter(prefix="/simulations", tags=["Policy Simulation Lab"])

class ScenarioCreateSchema(BaseModel):
    title: str
    description: str = None
    region: str
    baseline_year: int = 2024
    target_year: int = 2030
    policy_variable: str
    parameters: dict = {}

@router.get("/scenarios")
def list_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(SimulationScenario).order_by(SimulationScenario.created_at.desc()).all()
    result = []
    for s in scenarios:
        try:
            params = json.loads(s.parameters_json)
        except Exception:
            params = {}

        runs = [
            {
                "id": r.id,
                "status": r.status,
                "started_at": r.started_at.isoformat() if r.started_at else None,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None
            }
            for r in s.runs
        ]

        result.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "region": s.region,
            "baseline_year": s.baseline_year,
            "target_year": s.target_year,
            "policy_variable": s.policy_variable,
            "parameters": params,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "runs": runs
        })
    return result

@router.post("/scenarios")
def create_scenario(
    data: ScenarioCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scenario = SimulationScenario(
        title=data.title,
        description=data.description,
        region=data.region,
        baseline_year=data.baseline_year,
        target_year=data.target_year,
        policy_variable=data.policy_variable,
        parameters_json=json.dumps(data.parameters),
        created_by=current_user.id
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="CREATE",
        entity_type="SimulationScenario",
        entity_id=str(scenario.id),
        new_value=f"Created policy scenario '{scenario.title}' in {scenario.region}"
    )
    db.add(log)
    db.commit()

    return {
        "message": "Policy simulation scenario successfully created and persisted.",
        "scenario_id": scenario.id,
        "title": scenario.title
    }

@router.post("/scenarios/{scenario_id}/run")
def run_simulation_scenario(
    scenario_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")

    try:
        params = json.loads(scenario.parameters_json)
    except Exception:
        params = {}

    run = SimulationRun(
        scenario_id=scenario.id,
        status="RUNNING",
        started_at=datetime.datetime.utcnow()
    )
    db.add(run)
    db.commit()

    results_dict, logs_text = execute_policy_simulation(
        scenario_id=scenario.id,
        parameters=params,
        region=scenario.region,
        baseline_year=scenario.baseline_year,
        target_year=scenario.target_year
    )

    run.status = "COMPLETED"
    run.completed_at = datetime.datetime.utcnow()
    run.results_json = json.dumps(results_dict)
    run.execution_logs = logs_text

    # Audit log
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="EXECUTE",
        entity_type="SimulationRun",
        entity_id=str(run.id),
        new_value=f"Executed simulation run for scenario #{scenario.id} ({scenario.title})"
    )
    db.add(log)
    db.commit()
    db.refresh(run)

    return {
        "message": "Simulation run successfully completed and results persisted.",
        "run_id": run.id,
        "status": run.status,
        "results": results_dict,
        "logs": run.execution_logs
    }

@router.get("/runs/{run_id}")
def get_simulation_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(SimulationRun).filter(SimulationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Simulation run not found")

    try:
        results = json.loads(run.results_json)
    except Exception:
        results = {}

    return {
        "id": run.id,
        "scenario_id": run.scenario_id,
        "scenario_title": run.scenario.title if run.scenario else "Policy Scenario",
        "region": run.scenario.region if run.scenario else "National",
        "status": run.status,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "results": results,
        "execution_logs": run.execution_logs
    }
