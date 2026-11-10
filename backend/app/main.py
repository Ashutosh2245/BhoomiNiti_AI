import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.api.auth import router as auth_router
from app.api.audit import router as audit_router
from app.api.knowledge import router as knowledge_router, dataset_router
from app.api.ai_assistant import router as ai_router
from app.api.gis import router as gis_router
from app.api.analytics import router as analytics_router
from app.api.simulations import router as simulation_router
from app.api.collaboration import router as collab_router
from app.api.innovation import router as innovation_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router
from app.api.sources import router as sources_router
from app.api.search import router as search_router

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BhoomiNiti AI National Land Governance Enterprise Platform",
    description="Backend API services for research, policy innovation, evidence-based land governance, GIS, and simulations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(sources_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")
app.include_router(knowledge_router, prefix="/api/v1")
app.include_router(dataset_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(gis_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(simulation_router, prefix="/api/v1")
app.include_router(collab_router, prefix="/api/v1")
app.include_router(innovation_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "UP",
        "api": "UP",
        "database": "UP (SQLite Persistent Store)",
        "search": "UP (Hybrid RAG Engine)",
        "gis": "UP (GeoJSON Spatial Matrix)",
        "version": "1.0.0",
        "timestamp": "2026-09-27T23:37:00 IST"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to BhoomiNiti AI Enterprise API Gateway",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
