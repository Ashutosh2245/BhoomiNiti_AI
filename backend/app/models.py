import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Table
)
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False) # Govt, University, ThinkTank, NGO
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="public_user")
    # Roles: super_admin, govt_official, researcher, academic, think_tank, gis_expert, innovation_partner, public_user
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    interests = Column(Text, default="[]")
    preferred_language = Column(String(50), default="en-hi")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(50), index=True, nullable=False)
    permission = Column(String(100), nullable=False)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    doc_type = Column(String(50), nullable=False, index=True) # research_paper, policy, legal, case_study
    category = Column(String(100), nullable=True)
    author = Column(String(255), nullable=True)
    organization_name = Column(String(255), nullable=True)
    publication_year = Column(Integer, nullable=True)
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True, index=True)
    access_level = Column(String(50), default="PUBLIC", nullable=False) # PUBLIC, INTERNAL, RESTRICTED, CONFIDENTIAL
    file_path = Column(String(500), nullable=True)
    file_hash = Column(String(128), nullable=True)
    mime_type = Column(String(100), default="application/pdf")
    file_size = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    content_text = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)

    # Verification & Source Verification Fields
    status = Column(String(50), default="PUBLISHED", index=True) # PUBLISHED, DRAFT, ARCHIVED, UNPUBLISHED
    published_date = Column(String(100), default="15 Mar 2024") # Official publication date
    source_type = Column(String(50), default="PLATFORM") # PLATFORM, GOVERNMENT, ACADEMIC, RESEARCH_ORGANIZATION, INTERNATIONAL_ORGANIZATION, USER_SUBMITTED, DEMONSTRATION
    source_name = Column(String(255), default="BhoomiNiti Platform Repository")
    source_url = Column(String(500), nullable=True)
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, PENDING, UNVERIFIED, REJECTED
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_by = Column(String(255), default="BhoomiNiti Integrity Engine")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    metadata_rel = relationship("DocumentMetadata", back_populates="document", uselist=False, cascade="all, delete-orphan")

class SavedDocument(Base):
    __tablename__ = "saved_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False, default=1)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(128), nullable=True)
    change_summary = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="versions")

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    abstract = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True)
    methodology = Column(Text, nullable=True)
    related_policies = Column(Text, nullable=True)
    keywords = Column(String(500), nullable=True)
    citations_text = Column(Text, nullable=True)

    document = relationship("Document", back_populates="metadata_rel")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    format = Column(String(50), default="CSV")
    spatial_coverage = Column(String(255), nullable=True)
    temporal_coverage = Column(String(255), nullable=True)
    access_level = Column(String(50), default="PUBLIC")
    file_path = Column(String(500), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    quality_score = Column(Float, default=95.0)
    row_count = Column(Integer, default=0)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class GisLayer(Base):
    __tablename__ = "gis_layers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    layer_type = Column(String(50), nullable=False) # LULC, Agriculture, Urban, Forest, Water, Climate, Infrastructure, RemoteSensing
    category = Column(String(100), nullable=True)
    crs = Column(String(50), default="EPSG:4326")
    source_name = Column(String(255), nullable=True)
    visibility = Column(Boolean, default=True)
    access_level = Column(String(50), default="PUBLIC")
    geojson_data = Column(Text, nullable=False, default="{}")
    metadata_json = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    formula = Column(Text, nullable=True)
    data_source = Column(String(255), nullable=True)
    unit = Column(String(50), nullable=True)
    frequency = Column(String(50), default="Annual")
    baseline_val = Column(Float, default=0.0)
    target_val = Column(Float, default=0.0)
    current_val = Column(Float, default=0.0)
    owner = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE")
    version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    region = Column(String(100), nullable=False)
    baseline_year = Column(Integer, default=2024)
    target_year = Column(Integer, default=2030)
    policy_variable = Column(String(255), nullable=False)
    parameters_json = Column(Text, default="{}")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    runs = relationship("SimulationRun", back_populates="scenario", cascade="all, delete-orphan")

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("simulation_scenarios.id"), nullable=False)
    status = Column(String(50), default="QUEUED") # QUEUED, RUNNING, COMPLETED, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    results_json = Column(Text, default="{}")
    execution_logs = Column(Text, nullable=True)

    scenario = relationship("SimulationScenario", back_populates="runs")

class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    organization_name = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE") # ACTIVE, PLANNING, COMPLETED
    budget = Column(Float, default=0.0)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")

class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, COMPLETED
    assignee_name = Column(String(255), nullable=True)
    due_date = Column(String(50), nullable=True)

    project = relationship("ResearchProject", back_populates="tasks")

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    discussions = relationship("Discussion", back_populates="workspace", cascade="all, delete-orphan")

class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    user_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="discussions")

class InnovationChallenge(Base):
    __tablename__ = "innovation_challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    eligibility = Column(Text, nullable=True)
    reward_pool = Column(String(100), default="₹10,000,000")
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    status = Column(String(50), default="OPEN") # OPEN, EVALUATION, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submissions = relationship("ChallengeSubmission", back_populates="challenge", cascade="all, delete-orphan")

class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("innovation_challenges.id"), nullable=False)
    team_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    proposal_text = Column(Text, nullable=False)
    status = Column(String(50), default="SUBMITTED") # SUBMITTED, SCREENED, SHORTLISTED, SELECTED, PILOT, COMPLETED
    submitted_by = Column(String(255), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    challenge = relationship("InnovationChallenge", back_populates="submissions")

class GrantPilot(Base):
    __tablename__ = "grants_pilots"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), default="GRANT") # GRANT or PILOT
    title = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=False)
    amount = Column(String(100), default="₹2,500,000")
    status = Column(String(50), default="ACTIVE")
    timeline = Column(String(100), default="2025-2026")
    impact_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(255), default="System")
    user_role = Column(String(50), default="public_user")
    action = Column(String(50), nullable=False) # CREATE, READ, UPDATE, DELETE, EXECUTE, AUTH
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String(50), default="127.0.0.1")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    organization = Column(String(255), default="Government of India")
    source_type = Column(String(50), nullable=False, default="INTERNAL_PLATFORM")
    # GOVERNMENT_CENTRAL, GOVERNMENT_STATE, STATUTORY_LEGAL, ACADEMIC, RESEARCH_ORGANIZATION, INTERNATIONAL, OPEN_DATA, INTERNAL_PLATFORM, DEMONSTRATION
    category = Column(String(50), nullable=False, default="PLATFORM_DATA") # PLATFORM_DATA, EXTERNAL_DATA, DEMONSTRATION_DATA
    description = Column(Text, nullable=True)
    connection_type = Column(String(100), nullable=False, default="REST_API")
    base_url = Column(String(500), nullable=True)
    source_page_url = Column(String(500), nullable=True)
    api_url = Column(String(500), nullable=True)
    endpoint_url = Column(String(500), nullable=True)
    access_method = Column(String(100), default="AUTOMATED_INGESTION")
    license = Column(String(100), default="Open Government Data (OGD) Licence India")
    geographic_scope = Column(String(100), default="National / All States")
    temporal_scope = Column(String(100), default="2016-2026")
    update_frequency = Column(String(100), default="Quarterly")
    status = Column(String(50), default="CONNECTED") # CONNECTED, SYNCING, FAILED, NOT_CONFIGURED, DISABLED
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, PENDING, UNVERIFIED
    last_checked_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_successful_sync = Column(DateTime, nullable=True)
    last_sync_attempt = Column(DateTime, nullable=True)
    last_failed_sync = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    data_timestamp = Column(String(100), nullable=True)
    version = Column(String(50), default="v1.0")
    record_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    sync_jobs = relationship("SourceSyncJob", back_populates="source", cascade="all, delete-orphan")

class SourceSyncJob(Base):
    __tablename__ = "source_sync_jobs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="RUNNING") # RUNNING, SUCCESS, FAILED
    records_found = Column(Integer, default=0)
    records_added = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    source_version = Column(String(50), default="v1.0")

    source = relationship("DataSource", back_populates="sync_jobs")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. BN-2026-8492
    title = Column(String(500), nullable=False)
    title_hi = Column(String(500), nullable=True)
    report_type = Column(String(100), default="INTELLIGENCE_BRIEF") # INTELLIGENCE_BRIEF, POLICY_EVIDENCE, RESEARCH_SYNTHESIS, GIS_ANALYSIS
    language = Column(String(50), default="en-hi") # en, hi, en-hi
    analysis_id = Column(String(100), nullable=True)
    format = Column(String(50), default="pdf") # pdf, docx, excel, csv, json
    generated_by = Column(String(255), default="Dr. Rajesh Kumar Sharma (Super Admin)")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    data_period_start = Column(String(100), default="2020")
    data_period_end = Column(String(100), default="2026")
    data_snapshot_version = Column(String(100), default="v2026.1")
    status = Column(String(50), default="COMPLETED") # QUEUED, GENERATING, COMPLETED, FAILED, EXPIRED
    data_status = Column(String(100), default="VERIFIED_GOVERNMENT") # VERIFIED_GOVERNMENT, PLATFORM_EXTERNAL, DEMONSTRATION
    storage_key = Column(String(500), nullable=True)
    file_hash = Column(String(128), nullable=True)
    filters_json = Column(Text, default="{}")
    snapshot_json = Column(Text, default="{}") # Reproducibility snapshot
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)



