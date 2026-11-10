import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GisLayer, Document, Dataset, ResearchProject, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/gis", tags=["GIS & Spatial Intelligence"])

@router.get("/layers")
def get_gis_layers(db: Session = Depends(get_db)):
    layers = db.query(GisLayer).all()
    result = []
    for l in layers:
        try:
            geojson = json.loads(l.geojson_data)
        except Exception:
            geojson = {}
        try:
            metadata = json.loads(l.metadata_json)
        except Exception:
            metadata = {}

        result.append({
            "id": l.id,
            "name": l.name,
            "layer_type": l.layer_type,
            "category": l.category,
            "crs": l.crs,
            "source_name": l.source_name,
            "visibility": l.visibility,
            "access_level": l.access_level,
            "geojson_data": geojson,
            "metadata": metadata,
            "updated_at": l.updated_at.isoformat() if l.updated_at else None
        })
    return result

@router.get("/query-region")
def query_region_context(
    state: str = Query(...),
    district: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query documents for region
    doc_query = db.query(Document).filter(Document.state.ilike(f"%{state}%"))
    if current_user.role in ["public_user", "innovation_partner"]:
        doc_query = doc_query.filter(Document.access_level == "PUBLIC")

    docs = doc_query.all()

    research_papers = [d for d in docs if d.doc_type == "research_paper"]
    policies = [d for d in docs if d.doc_type == "policy"]
    case_studies = [d for d in docs if d.doc_type == "case_study"]

    # Datasets
    datasets = db.query(Dataset).filter(Dataset.spatial_coverage.ilike(f"%{state}%")).all()

    # Projects
    projects = db.query(ResearchProject).all()

    return {
        "region": {
            "state": state,
            "district": district or "State-wide Area"
        },
        "indicators": {
            "digitization_coverage": "94.2%" if state == "Maharashtra" else ("91.8%" if state == "Karnataka" else "88.5%"),
            "dispute_velocity": "Accelerated Settlement (+18%)",
            "primary_land_use": "Agricultural & Peri-Urban Zone",
            "remote_sensing_ndvi": 0.64
        },
        "research_papers": [
            {"id": r.id, "title": r.title, "author": r.author, "year": r.publication_year, "summary": r.summary}
            for r in research_papers
        ],
        "policies": [
            {"id": p.id, "title": p.title, "category": p.category, "summary": p.summary}
            for p in policies
        ],
        "case_studies": [
            {"id": c.id, "title": c.title, "category": c.category, "summary": c.summary}
            for c in case_studies
        ],
        "datasets": [
            {"id": ds.id, "title": ds.title, "format": ds.format, "quality_score": ds.quality_score}
            for ds in datasets
        ],
        "projects": [
            {"id": pr.id, "title": pr.title, "status": pr.status, "org": pr.organization_name}
            for pr in projects[:3]
        ]
    }
