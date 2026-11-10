import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import datetime
import json
from passlib.context import CryptContext
from app.database import Base, engine, SessionLocal
from app.models import (
    Organization, User, Document, DocumentVersion, DocumentMetadata,
    Dataset, GisLayer, Indicator, SimulationScenario, SimulationRun,
    ResearchProject, ProjectTask, Workspace, Discussion,
    InnovationChallenge, ChallengeSubmission, GrantPilot, AuditLog, SystemSetting, DataSource
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_db():
    Base.metadata.create_all(bind=engine)
    
    # SQLite migration helper for new columns
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            cols = [r[1] for r in res]
            if "interests" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN interests TEXT DEFAULT '[]'"))
            if "preferred_language" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'en-hi'"))
            conn.commit()
        except Exception as e:
            print("Migration warning:", e)

    db = SessionLocal()

    try:
        # Check if DB already seeded
        if db.query(User).filter(User.email == "admin@bhoominiti.gov.in").first():
            print("Database already seeded.")
            return

        print("Seeding BhoomiNiti AI Enterprise Database...")

        # 1. Organizations
        orgs = [
            Organization(name="Ministry of Rural Development", type="Government", state="Delhi", district="New Delhi", contact_email="mord@nic.in"),
            Organization(name="NITI Aayog Land Policy Division", type="Government", state="Delhi", district="New Delhi", contact_email="land@niti.gov.in"),
            Organization(name="Survey of India", type="Government", state="Uttarakhand", district="Dehradun", contact_email="soi@gov.in"),
            Organization(name="National Remote Sensing Centre (NRSC / ISRO)", type="Government", state="Telangana", district="Hyderabad", contact_email="nrsc@isro.gov.in"),
            Organization(name="IIT Bombay - Centre for Technology Alternatives", type="University", state="Maharashtra", district="Mumbai", contact_email="cera@iitb.ac.in"),
            Organization(name="Centre for Land Governance & Policy Research", type="ThinkTank", state="Odisha", district="Bhubaneswar", contact_email="info@landgovernance.org"),
            Organization(name="Tata Institute of Social Sciences (TISS)", type="University", state="Maharashtra", district="Mumbai", contact_email="land@tiss.edu"),
            Organization(name="AgriLand Tech Innovations", type="InnovationPartner", state="Karnataka", district="Bengaluru", contact_email="contact@agriland.io")
        ]
        db.add_all(orgs)
        db.commit()

        # 2. Users (All 8 Roles)
        users = [
            User(
                email="admin@bhoominiti.gov.in",
                hashed_password=pwd_context.hash("Admin@123456"),
                full_name="Dr. Rajesh Kumar Sharma (Super Admin)",
                role="super_admin",
                organization_id=1
            ),
            User(
                email="official@mord.gov.in",
                hashed_password=pwd_context.hash("Official@123"),
                full_name="Smt. Anita Verma (IAS, Joint Secretary)",
                role="govt_official",
                organization_id=1
            ),
            User(
                email="researcher@iitb.ac.in",
                hashed_password=pwd_context.hash("Researcher@123"),
                full_name="Prof. Arvind Deshmukh (Principal Investigator)",
                role="researcher",
                organization_id=5
            ),
            User(
                email="academic@tiss.edu",
                hashed_password=pwd_context.hash("Academic@123"),
                full_name="Dr. Meera Sen (Dean, Rural Development)",
                role="academic",
                organization_id=7
            ),
            User(
                email="thinktank@landgovernance.org",
                hashed_password=pwd_context.hash("Thinktank@123"),
                full_name="Sanjay Patnaik (Director, Policy Studies)",
                role="think_tank",
                organization_id=6
            ),
            User(
                email="gis.expert@nrsc.isro.gov.in",
                hashed_password=pwd_context.hash("Gis@123456"),
                full_name="Priya Ramachandran (Senior Remote Sensing Scientist)",
                role="gis_expert",
                organization_id=4
            ),
            User(
                email="partner@agriland.io",
                hashed_password=pwd_context.hash("Partner@123"),
                full_name="Karan Mehta (CTO, AgriLand Tech)",
                role="innovation_partner",
                organization_id=8
            ),
            User(
                email="citizen@public.org",
                hashed_password=pwd_context.hash("Public@123"),
                full_name="Sunil Rao (Public Citizen)",
                role="public_user",
                organization_id=None
            )
        ]
        db.add_all(users)
        db.commit()

        # 3. Documents (Research, Policies, Legal, Case Studies)
        docs = [
            # Research Papers
            Document(
                title="Impact of Digital Cadastral Mapping on Rural Land Dispute Resolution in Maharashtra",
                doc_type="research_paper",
                category="Land Administration",
                author="Prof. Arvind Deshmukh, Dr. Sneha Kulkarni",
                organization_name="IIT Bombay",
                publication_year=2024,
                state="Maharashtra",
                district="Pune",
                access_level="PUBLIC",
                summary="Empirical study analyzing 4,500 digitized parcel records across Pune district demonstrating a 34% reduction in boundary litigation over 3 years.",
                content_text="Digital cadastral surveys utilizing high-resolution UAV imagery and DGPS ground control points have transformed land title clarity in Western Maharashtra.",
                tags="digital mapping, cadastral, litigation, maharashtra, gis, drones",
                status="PUBLISHED",
                published_date="18 Jan 2024",
                source_type="ACADEMIC",
                source_name="IIT Bombay Journal of Land Use Science",
                source_url="https://cera.iitb.ac.in/publications/cadastral-maharashtra-2024",
                verification_status="VERIFIED",
                created_by=3
            ),
            Document(
                title="Assessment of Agricultural Land Conversion to Urban Peri-Urban Zones in Bengaluru Rural",
                doc_type="research_paper",
                category="Land Use Change",
                author="Dr. Ramesh Rao, Priya Ramachandran",
                organization_name="ISRO NRSC & IISc",
                publication_year=2023,
                state="Karnataka",
                district="Bengaluru Rural",
                access_level="PUBLIC",
                summary="Multi-temporal satellite imagery analysis (2010-2023) detailing 18.4% loss of prime agricultural land to industrial corridors.",
                content_text="Landsat-8 and Sentinel-2 imagery were processed using NDVI and NDBI spectral indices to track urban sprawl across Devanahalli and Nelamangala taluks.",
                tags="remote sensing, urban sprawl, satellite imagery, karnataka, LULC",
                status="PUBLISHED",
                published_date="12 Nov 2023",
                source_type="RESEARCH_ORGANIZATION",
                source_name="ISRO National Remote Sensing Centre (NRSC) Technical Report",
                source_url="https://nrsc.isro.gov.in/reports/bengaluru-lulc-2023",
                verification_status="VERIFIED",
                created_by=6
            ),
            # Policies
            Document(
                title="National Land Reform and Agricultural Diversion Policy Framework 2024",
                doc_type="policy",
                category="Policy Guideline",
                author="NITI Aayog & Ministry of Rural Development",
                organization_name="Government of India",
                publication_year=2024,
                state="National",
                district=None,
                access_level="PUBLIC",
                summary="Comprehensive policy guidelines regulating non-agricultural land conversion, protection of multi-cropped land, and automated single-window clearance.",
                content_text="This policy establishes mandatory environmental impact scores and agricultural productivity indices before approving prime farmland diversion.",
                tags="policy, land conversion, NITI Aayog, agriculture, regulations",
                status="PUBLISHED",
                published_date="05 Feb 2024",
                source_type="GOVERNMENT",
                source_name="NITI Aayog & Ministry of Rural Development Gazette",
                source_url="https://niti.gov.in/policy-frameworks/land-diversion-2024",
                verification_status="VERIFIED",
                created_by=2
            ),
            Document(
                title="Odisha Forest Rights Act (FRA) Implementation & Community Forest Resource Rights Policy",
                doc_type="policy",
                category="Tribal & Tenure Rights",
                author="Department of Tribal Affairs, Govt of Odisha",
                organization_name="Govt of Odisha",
                publication_year=2023,
                state="Odisha",
                district="Mayurbhanj",
                access_level="PUBLIC",
                summary="Operational manual for granting CFR titles to Gram Sabhas and integrating spatial boundaries into State GIS portal.",
                content_text="Outlines systematic mapping protocol for tribal community rights verification across Mayurbhanj, Kandhamal, and Koraput districts.",
                tags="odisha, forest rights, FRA, tribal lands, tenure security",
                status="PUBLISHED",
                published_date="22 Aug 2023",
                source_type="GOVERNMENT",
                source_name="Department of Tribal Affairs, Government of Odisha",
                source_url="https://stsc.odisha.gov.in/fra-policy-guidelines",
                verification_status="VERIFIED",
                created_by=5
            ),
            # Legal Documents
            Document(
                title="Right to Fair Compensation and Transparency in Land Acquisition Act (RFCTLARR 2013 Framework)",
                doc_type="legal",
                category="Statutory Law",
                author="Parliament of India",
                organization_name="Ministry of Law and Justice",
                publication_year=2013,
                state="National",
                district=None,
                access_level="PUBLIC",
                summary="The primary statutory enactment governing mandatory consent, social impact assessment (SIA), and market value compensation for compulsory acquisitions.",
                content_text="Full legal statutory text of RFCTLARR Act 2013 including amendments, judicial interpretations, SIA guidelines, and rehabilitation provisions.",
                tags="RFCTLARR, acquisition law, legal framework, compensation, SIA",
                status="PUBLISHED",
                published_date="27 Sep 2013",
                source_type="GOVERNMENT",
                source_name="Ministry of Law and Justice (India Code Gazette Act No. 30 of 2013)",
                source_url="https://www.indiacode.nic.in/handle/123456789/2121",
                verification_status="VERIFIED",
                created_by=1
            ),
            Document(
                title="SVAMITVA Scheme Implementation Case Study: Drone Surveying in Uttar Pradesh Village Abadi Areas",
                doc_type="case_study",
                category="Property Cards",
                author="Survey of India & UP Revenue Department",
                organization_name="Survey of India",
                publication_year=2023,
                state="Uttar Pradesh",
                district="Varanasi",
                access_level="PUBLIC",
                summary="Case analysis of 1,200 rural habited villages mapped via high-precision drones resulting in 240,000 Property Cards (Gharouni) issued.",
                content_text="Detailed examination of field operations, Gram Panchayat mobilization, dispute adjudication committees, and spatial database creation in rural UP.",
                tags="SVAMITVA, property cards, drones, uttar pradesh, rural land, varanasi",
                status="PUBLISHED",
                published_date="14 Apr 2023",
                source_type="GOVERNMENT",
                source_name="Ministry of Panchayati Raj & Survey of India",
                source_url="https://svamitva.nic.in/case-studies/varanasi-drone-survey",
                verification_status="VERIFIED",
                created_by=2
            ),
            Document(
                title="Varanasi Urbanization and Peri-Urban Land Use Conversion Evaluation Report",
                doc_type="research_paper",
                category="Urbanization & Land Use",
                author="Dr. Anand Prakash, Prof. K. N. Singh",
                organization_name="Banaras Hindu University (BHU) & NITI Aayog Land Unit",
                publication_year=2024,
                state="Uttar Pradesh",
                district="Varanasi",
                access_level="PUBLIC",
                summary="Comprehensive report detailing 14.2% expansion of urban built-up area in Varanasi peri-urban corridors and agricultural land diversion patterns from 2018 to 2024.",
                content_text="Analysis of remote sensing land cover transitions and cadastral conversion records across Varanasi district peri-urban zones.",
                tags="varanasi, urbanization, urban sprawl, land use conversion, uttar pradesh, report, peri-urban",
                status="PUBLISHED",
                published_date="20 May 2024",
                source_type="ACADEMIC",
                source_name="BHU Department of Land Resources & Policy Studies",
                source_url="https://bhu.ac.in/research/varanasi-urbanization-report-2024",
                verification_status="VERIFIED",
                created_by=3
            )
        ]
        db.add_all(docs)
        db.commit()

        # Metadata for Documents
        doc_meta = [
            DocumentMetadata(
                document_id=1,
                abstract="This paper examines the impact of high-resolution digital cadastral mapping on boundary dispute litigation in rural Maharashtra.",
                key_findings="1. 34% drop in boundary lawsuits within 36 months.\n2. Average title verification time reduced from 42 days to 3 days.\n3. Female co-ownership recording increased by 19%.",
                methodology="Double difference econometrics comparing digitized pilot talukas against traditional survey control talukas.",
                related_policies="Maharashtra Land Revenue Code 1966 & Digital India Land Records Modernization Programme (DILRMP).",
                keywords="Cadastral, UAV, Dispute, DILRMP, Maharashtra",
                citations_text="Deshmukh, A. et al. (2024). 'Digital Cadastre and Rural Land Governance'. Journal of Land Use Science, 19(2), 112-130."
            ),
            DocumentMetadata(
                document_id=2,
                abstract="Remote sensing evaluation of agricultural land loss around Bengaluru metropolis from 2010 to 2023.",
                key_findings="1. 18.4% reduction in prime irrigated agricultural area.\n2. Built-up density expanded by 42.1% along NH-44 corridor.\n3. Groundwater recharge capability degraded by 22%.",
                methodology="Multi-temporal Landsat-8 and Sentinel-2 spectroradiometric processing with GIS layer overlays.",
                related_policies="Karnataka Land Reforms Act & Metropolitan Spatial Plan 2031.",
                keywords="Remote Sensing, LULC, Bengaluru, Urbanization, Satellite",
                citations_text="Rao, R. & Ramachandran, P. (2023). 'Satellite Monitoring of Peri-Urban Conversion'. ISRO Technical Report 2023-45."
            )
        ]
        db.add_all(doc_meta)
        db.commit()

        # Document Versions
        versions = [
            DocumentVersion(document_id=1, version_number=1, file_path="uploads/doc1_v1.pdf", file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", change_summary="Initial publication release.", uploaded_by=3),
            DocumentVersion(document_id=3, version_number=1, file_path="uploads/policy_2024.pdf", file_hash="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", change_summary="Official NITI Aayog policy gazette draft.", uploaded_by=2)
        ]
        db.add_all(versions)
        db.commit()

        # 4. Datasets
        datasets = [
            Dataset(
                title="National Land Use Land Cover (LULC) 250k Spatial Matrix (2023-24)",
                category="Geospatial",
                format="GeoTIFF / GeoJSON",
                spatial_coverage="India (National / State Level)",
                temporal_coverage="2023-2024",
                access_level="PUBLIC",
                file_path="uploads/datasets/lulc_national_2024.geojson",
                owner_id=6,
                quality_score=98.5,
                row_count=36,
                metadata_json=json.dumps({"spatial_resolution": "56m", "sensor": "AWiFS", "classes": 18})
            ),
            Dataset(
                title="State-wise Land Dispute Pending Cases Statistics & Settlement Duration (2020-2024)",
                category="Administrative",
                format="CSV",
                spatial_coverage="All States & UTs",
                temporal_coverage="2020-2024",
                access_level="PUBLIC",
                file_path="uploads/datasets/dispute_stats_2024.csv",
                owner_id=2,
                quality_score=94.0,
                row_count=718,
                metadata_json=json.dumps({"source": "High Courts & Revenue Department Reports", "total_cases": 1420500})
            ),
            Dataset(
                title="District-Level Climate Vulnerability Index & Soil Moisture Profiles for Western Ghats",
                category="Environmental",
                format="CSV / GeoJSON",
                spatial_coverage="Maharashtra, Goa, Karnataka, Kerala",
                temporal_coverage="2018-2024",
                access_level="PUBLIC",
                file_path="uploads/datasets/climate_vulnerability_wg.csv",
                owner_id=3,
                quality_score=96.2,
                row_count=52,
                metadata_json=json.dumps({"indicators": ["drought_risk", "landslide_risk", "topsoil_erosion"]})
            )
        ]
        db.add_all(datasets)
        db.commit()

        # 5. GIS Layers & Features
        gis_layers = [
            GisLayer(
                name="Indian States & Land Governance Profile Layer",
                layer_type="Administrative",
                category="State Boundaries",
                crs="EPSG:4326",
                source_name="Survey of India Open Series Maps",
                visibility=True,
                access_level="PUBLIC",
                geojson_data=json.dumps({
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [73.8567, 18.5204]},
                            "properties": {
                                "state": "Maharashtra",
                                "district": "Pune",
                                "research_count": 27,
                                "policy_count": 8,
                                "dataset_count": 12,
                                "case_study_count": 6,
                                "project_count": 4,
                                "digitization_percentage": 94.2,
                                "lulc_primary": "Agricultural / Built-up",
                                "dispute_velocity": "High Resolution (+18%)"
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [77.5946, 12.9716]},
                            "properties": {
                                "state": "Karnataka",
                                "district": "Bengaluru Rural",
                                "research_count": 19,
                                "policy_count": 5,
                                "dataset_count": 9,
                                "case_study_count": 4,
                                "project_count": 3,
                                "digitization_percentage": 91.8,
                                "lulc_primary": "Urban Expansion / Agri Diversion",
                                "dispute_velocity": "Moderate (+8%)"
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [85.8246, 20.2961]},
                            "properties": {
                                "state": "Odisha",
                                "district": "Mayurbhanj",
                                "research_count": 14,
                                "policy_count": 11,
                                "dataset_count": 7,
                                "case_study_count": 8,
                                "project_count": 5,
                                "digitization_percentage": 88.5,
                                "lulc_primary": "Forest / Community Rights",
                                "dispute_velocity": "Rapid Resolution (+31%)"
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [82.9739, 25.3176]},
                            "properties": {
                                "state": "Uttar Pradesh",
                                "district": "Varanasi",
                                "research_count": 22,
                                "policy_count": 9,
                                "dataset_count": 15,
                                "case_study_count": 10,
                                "project_count": 6,
                                "digitization_percentage": 97.1,
                                "lulc_primary": "Habited Abadi / SVAMITVA",
                                "dispute_velocity": "Very High (+24%)"
                            }
                        }
                    ]
                }),
                metadata_json=json.dumps({"provider": "Survey of India", "version": "2024.1"})
            ),
            GisLayer(
                name="Remote Sensing Sentinel NDVI Vegetation Index Matrix",
                layer_type="RemoteSensing",
                category="Satellite Imagery Derivations",
                crs="EPSG:4326",
                source_name="Sentinel-2 Satellite Band Calculations",
                visibility=True,
                access_level="PUBLIC",
                geojson_data=json.dumps({
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [74.2000, 19.1000]},
                            "properties": {"region": "Nashik Agricultural Belt", "mean_ndvi": 0.68, "vegetation_health": "Healthy Crop", "change_index_yoy": "+4.2%"}
                        },
                        {
                            "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [76.5000, 15.3000]},
                            "properties": {"region": "North Karnataka Dry Zone", "mean_ndvi": 0.32, "vegetation_health": "Moderate Moisture Deficit", "change_index_yoy": "-2.1%"}
                        }
                    ]
                }),
                metadata_json=json.dumps({"sensor": "Sentinel-2 MSI", "resolution": "10m", "data_nature": "Representative Dataset"})
            )
        ]
        db.add_all(gis_layers)
        db.commit()

        # 6. Indicators
        indicators = [
            Indicator(
                code="IND-LULC-01",
                name="Agricultural Land Conversion Velocity Index (%)",
                description="Percentage annual rate of high-yield agricultural land diverted for urban, commercial or industrial use.",
                formula="(Diverted Agricultural Area / Total Baseline Agricultural Area) * 100",
                data_source="NRSC Satellite LULC Mapping & Revenue Records",
                unit="Percentage (%)",
                frequency="Annual",
                baseline_val=1.45,
                target_val=0.75,
                current_val=1.12,
                owner="NITI Aayog Policy Cell",
                status="ACTIVE",
                version=2
            ),
            Indicator(
                code="IND-DILRMP-02",
                name="Digitized Cadastral Map & Parcel Record Synchronization Rate (%)",
                description="Percentage of total land parcels with spatially vector-aligned cadastral maps matched with textual revenue records.",
                formula="(Fully Synchronized Parcels / Total Registered State Parcels) * 100",
                data_source="State Revenue Land Records Database (DILRMP)",
                unit="Percentage (%)",
                frequency="Quarterly",
                baseline_val=68.0,
                target_val=98.0,
                current_val=89.4,
                owner="Ministry of Rural Development",
                status="ACTIVE",
                version=3
            ),
            Indicator(
                code="IND-CLIM-03",
                name="Land Degradation Neutrality (LDN) Resilience Score",
                description="Composite index measuring topsoil erosion, organic carbon retention, and vegetation regrowth across vulnerable agro-climatic zones.",
                formula="Weighted Index: 0.4*(Soil Carbon) + 0.3*(NDVI Delta) + 0.3*(Erosion Mitigation)",
                data_source="ISRO Soil & Climate Monitoring Grids",
                unit="Index (0-100)",
                frequency="Annual",
                baseline_val=54.2,
                target_val=80.0,
                current_val=67.8,
                owner="Dept of Agriculture & Land Resources",
                status="ACTIVE",
                version=1
            ),
            Indicator(
                code="IND-DISP-04",
                name="Average Land Dispute Adjudication Cycle Time (Months)",
                description="Mean duration in months required to settle title or boundary dispute petitions at Sub-Divisional Officer / Revenue Court level.",
                formula="Sum(Dispute Settlement Durations) / Total Resolved Disputes",
                data_source="National Judicial Data Grid & State Revenue Courts",
                unit="Months",
                frequency="Bi-Annual",
                baseline_val=36.0,
                target_val=6.0,
                current_val=14.2,
                owner="Department of Justice & Land Resources",
                status="ACTIVE",
                version=2
            )
        ]
        db.add_all(indicators)
        db.commit()

        # 7. Simulation Scenarios & Runs
        scenarios = [
            SimulationScenario(
                title="Impact of 30% Prime Agricultural Land Conversion Restrictions on Food Security & Peri-Urban Land Value (2024-2030)",
                description="Simulates the spatial-economic effect of capping non-agricultural diversion in high-productivity irrigation belts over a 6-year period.",
                region="Maharashtra & Karnataka Corridor",
                baseline_year=2024,
                target_year=2030,
                policy_variable="Agricultural Land Diversion Cap (%)",
                parameters_json=json.dumps({"diversion_cap_percent": 30.0, "industrial_demand_growth": 5.5, "compensation_multiplier": 2.5, "enforcement_strictness": "High"}),
                created_by=2
            ),
            SimulationScenario(
                title="Full Drone-Cadastral Synchronization Impact on Rural Property Credit & Dispute Litigation (2024-2028)",
                description="Models credit access growth via SVAMITVA property cards versus legal dispute reduction under 100% vector survey coverage.",
                region="Uttar Pradesh & Bihar",
                baseline_year=2024,
                target_year=2028,
                policy_variable="SVAMITVA Parcel Coverage (%)",
                parameters_json=json.dumps({"parcel_coverage_percent": 100.0, "banking_mortgage_adoption": 42.0, "litigation_drop_rate": 35.0}),
                created_by=3
            )
        ]
        db.add_all(scenarios)
        db.commit()

        sim_runs = [
            SimulationRun(
                scenario_id=1,
                status="COMPLETED",
                started_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                completed_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=52),
                results_json=json.dumps({
                    "projected_agricultural_preservation_hectares": 142800,
                    "estimated_food_yield_protection_tons": 385000,
                    "peri_urban_land_price_index_change": "+14.8%",
                    "industrial_relocation_to_barren_land_percent": 68.4,
                    "environmental_carbon_sequestration_delta_tonnes": 52000,
                    "model_uncertainty_margin": "± 4.2%",
                    "yearly_projections": [
                        {"year": 2025, "agri_preserved_ha": 23800, "price_index": 102.5},
                        {"year": 2026, "agri_preserved_ha": 47600, "price_index": 105.8},
                        {"year": 2027, "agri_preserved_ha": 71400, "price_index": 109.1},
                        {"year": 2028, "agri_preserved_ha": 95200, "price_index": 111.4},
                        {"year": 2029, "agri_preserved_ha": 119000, "price_index": 113.2},
                        {"year": 2030, "agri_preserved_ha": 142800, "price_index": 114.8}
                    ]
                }),
                execution_logs="[INFO] Initialized Spatial Land Economy Cellular Automata Engine v2.4.\n[INFO] Loaded Baseline Soil Productivity Grids.\n[INFO] Executed 10,000 Monte Carlo Iterations.\n[SUCCESS] Simulation completed with zero convergence warnings."
            )
        ]
        db.add_all(sim_runs)
        db.commit()

        # 8. Research Projects & Tasks
        projects = [
            ResearchProject(
                title="National Climate-Resilient Agro-Forestry Land Governance Study",
                description="Multi-institutional research initiative mapping carbon credit potential and land tenure security for indigenous smallholder farmers.",
                organization_name="IIT Bombay & TISS Joint Project",
                status="ACTIVE",
                budget=15000000.0,
                start_date="2024-01-15",
                end_date="2026-12-31",
                created_by=3
            ),
            ResearchProject(
                title="AI-Powered Automatic Satellite Cadastral Boundary Change Detection",
                description="Development of deep learning models for automated encroachment detection along railway and highway corridors.",
                organization_name="ISRO NRSC & AgriLand Tech",
                status="ACTIVE",
                budget=8500000.0,
                start_date="2024-04-01",
                end_date="2025-09-30",
                created_by=6
            )
        ]
        db.add_all(projects)
        db.commit()

        tasks = [
            ProjectTask(project_id=1, title="Complete baseline socio-economic field survey across 40 tribal villages", status="COMPLETED", assignee_name="Dr. Meera Sen", due_date="2024-08-30"),
            ProjectTask(project_id=1, title="Synthesize spatial GIS boundary overlays with FRA tenure claims", status="IN_PROGRESS", assignee_name="Prof. Arvind Deshmukh", due_date="2024-11-15"),
            ProjectTask(project_id=2, title="Train Convolutional Neural Network on Sentinel 10m imagery", status="IN_PROGRESS", assignee_name="Priya Ramachandran", due_date="2024-12-20")
        ]
        db.add_all(tasks)
        db.commit()

        # 9. Workspaces & Discussions
        workspaces = [
            Workspace(name="National Land Reform Policy Working Group 2024", description="Inter-ministerial collaboration workspace for drafting non-agricultural land diversion guidelines.", owner_id=2, is_private=False),
            Workspace(name="GIS Spatial Intelligence & UAV Standards Cell", description="Technical taskforce establishing DGPS and drone survey precision specifications.", owner_id=6, is_private=False)
        ]
        db.add_all(workspaces)
        db.commit()

        discussions = [
            Discussion(workspace_id=1, user_name="Smt. Anita Verma (IAS)", title="Final Draft Review of SIA Exemption Criteria", content="Please review Section 4.2 regarding Social Impact Assessment exemptions for public renewable energy projects under 25 hectares.", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)),
            Discussion(workspace_id=1, user_name="Sanjay Patnaik", title="Inclusion of Tribal Gram Sabha Consent Protocols", content="We have submitted the revised wording ensuring Gram Sabha resolution compliance before any statutory survey commencement.", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1))
        ]
        db.add_all(discussions)
        db.commit()

        # 10. Innovation Challenges, Hackathons, Grants & Pilots
        challenges = [
            InnovationChallenge(
                title="National LandTech AI Innovation Challenge 2024",
                description="Grand innovation challenge seeking AI solutions for automated land document OCR, satellite encroachment detection, and dispute prediction.",
                problem_statement="Develop high-precision machine learning models capable of parsing handwritten regional vernacular land records (Modi, Devanagari, Kaithi script) into structured digital JSON.",
                eligibility="Indian Startups, University Researchers, Academic Institutions, Independent Developers.",
                reward_pool="₹10,000,000",
                start_date="2024-06-01",
                end_date="2024-11-30",
                status="OPEN"
            )
        ]
        db.add_all(challenges)
        db.commit()

        submissions = [
            ChallengeSubmission(
                challenge_id=1,
                team_name="AgriLand OCR Vision",
                title="Multilingual Vernacular Land Record OCR Transformer Model",
                proposal_text="Our solution utilizes a custom-trained Vision Transformer (ViT) achieving 96.4% character accuracy on 19th-century Marathi and Hindi land title deeds.",
                status="SHORTLISTED",
                submitted_by="Karan Mehta (AgriLand Tech)"
            )
        ]
        db.add_all(submissions)
        db.commit()

        grants = [
            GrantPilot(type="GRANT", title="High-Altitude Himalayan Cadastral Mapping Grant", organization_name="IIT Roorkee & Survey of India", amount="₹5,000,000", status="ACTIVE", timeline="2024-2026", impact_summary="Deployment of RTK-drones in steep terrain for accurate mountain tenure mapping."),
            GrantPilot(type="PILOT", title="Automated Blockchain Land Title Registry Pilot", organization_name="Govt of Telangana & NIC", amount="₹12,000,000", status="PILOT", timeline="2024-2025", impact_summary="Tamper-proof immutable title registry pilot across 12 sub-registrar offices in Medchal district.")
        ]
        db.add_all(grants)
        db.commit()

        # 11. Audit Logs & System Settings
        audit = [
            AuditLog(user_id=1, user_name="System Administrator", user_role="super_admin", action="SYSTEM_INIT", entity_type="System", entity_id="0", old_value=None, new_value="Database initialized and baseline datasets seeded.", ip_address="127.0.0.1"),
            AuditLog(user_id=2, user_name="Smt. Anita Verma (IAS)", user_role="govt_official", action="UPDATE", entity_type="Indicator", entity_id="IND-LULC-01", old_value="Target 1.0%", new_value="Target 0.75%", ip_address="10.14.2.19")
        ]
        db.add_all(audit)

        settings = [
            SystemSetting(key="PLATFORM_NAME", value="BhoomiNiti AI National Land Governance Platform", description="Main header platform name"),
            SystemSetting(key="DATA_REFRESH_TIME", value="2026-09-28 10:18 IST", description="Last system sync timestamp"),
            SystemSetting(key="ENABLE_AI_CITATIONS", value="TRUE", description="Require grounded source citations in AI Assistant")
        ]
        db.add_all(settings)

        # 12. Data Sources & Integration Registry
        sources = [
            DataSource(
                name="Department of Land Resources (DoLR)",
                organization="Ministry of Rural Development, Govt of India",
                source_type="GOVERNMENT_CENTRAL",
                category="EXTERNAL_DATA",
                description="Official portal of DoLR publishing DILRMP 3.0 Operational Guidelines (2026-2031), land governance initiatives, and policy gazettes.",
                connection_type="AUTOMATED_INGESTION_CONNECTOR",
                base_url="https://dolr.gov.in/",
                source_page_url="https://dolr.gov.in/en/programmes-schemes/dilrmp-2/",
                api_url="https://dolr.gov.in/api/v1/programmes",
                endpoint_url="https://dolr.gov.in/en/programmes-schemes/dilrmp-2/",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 10:18 IST",
                version="DILRMP 3.0 (2026-2031)",
                record_count=2,
                is_verified=True
            ),
            DataSource(
                name="Digital India Land Records Modernization Programme (DILRMP)",
                organization="Department of Land Resources, Govt of India",
                source_type="GOVERNMENT_CENTRAL",
                category="EXTERNAL_DATA",
                description="Programme documentation, operational guidelines, cadastral map vectorization progress, and RoR digitization statistics.",
                connection_type="PROGRAMME_MIS_INGESTION",
                base_url="https://dolr.gov.in/en/document-category/program-dilrmp/",
                source_page_url="https://dolr.gov.in/en/document-category/program-dilrmp/",
                api_url="https://dolr.gov.in/api/v1/dilrmp-stats",
                endpoint_url="https://dolr.gov.in/en/document-category/program-dilrmp/",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 09:30 IST",
                version="v2024.1",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="ULPIN / Bhu-Aadhaar National Registry Protocol",
                organization="Department of Land Resources & NIC",
                source_type="GOVERNMENT_CENTRAL",
                category="EXTERNAL_DATA",
                description="14-digit geo-referenced land parcel identification system based on geo-referenced parcel boundary coordinates.",
                connection_type="SECURE_PARCEL_SYNC",
                base_url="https://dolr.gov.in/en/ulpin/",
                source_page_url="https://dolr.gov.in/en/ulpin/",
                api_url="https://dolr.gov.in/api/v1/ulpin-info",
                endpoint_url="https://dolr.gov.in/en/ulpin/",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 08:00 IST",
                version="ULPIN 14-Digit Standard",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="SVAMITVA Scheme Portal & Property Card Audit",
                organization="Ministry of Panchayati Raj & Survey of India",
                source_type="GOVERNMENT_CENTRAL",
                category="EXTERNAL_DATA",
                description="Official portal exposing Property Card (Gharouni) distribution statistics across state, district, tehsil, and village boundaries.",
                connection_type="PUBLIC_AUDIT_DATA_FEED",
                base_url="https://svamitva.nic.in/",
                source_page_url="https://svamitva.nic.in/svamitva_audit/getPropertyCardDistributed.html",
                api_url="https://svamitva.nic.in/api/v1/property-cards",
                endpoint_url="https://svamitva.nic.in/svamitva_audit/getPropertyCardDistributed.html",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 07:45 IST",
                version="SVAMITVA 2024 Framework",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="India Code Statutory Law Gazette Repository",
                organization="Ministry of Law and Justice, Govt of India",
                source_type="STATUTORY_LEGAL",
                category="EXTERNAL_DATA",
                description="Official statutory repository exposing Acts of Parliament including RFCTLARR Act 2013 (Act No. 30 of 2013).",
                connection_type="STATUTORY_GAZETTE_INGESTION",
                base_url="https://www.indiacode.nic.in/",
                source_page_url="https://www.indiacode.nic.in/handle/123456789/2121",
                api_url="https://www.indiacode.nic.in/api/v1/act/2121",
                endpoint_url="https://www.indiacode.nic.in/handle/123456789/2121",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 06:15 IST",
                version="Act No. 30 of 2013",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="IIT Bombay Rural Technology & Cadastral Repository",
                organization="IIT Bombay (CTARA)",
                source_type="ACADEMIC",
                category="EXTERNAL_DATA",
                description="Peer-reviewed academic research papers examining drone cadastral surveys and dispute adjudication velocity in rural Maharashtra.",
                connection_type="ACADEMIC_OAI_PMH_INGESTION",
                base_url="https://cera.iitb.ac.in/",
                source_page_url="https://cera.iitb.ac.in/publications/cadastral-maharashtra-2024",
                api_url="https://cera.iitb.ac.in/oai/request",
                endpoint_url="https://cera.iitb.ac.in/publications/cadastral-maharashtra-2024",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="18 Jan 2024",
                version="DOI 10.1080/landuse.2024.112",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="ISRO National Remote Sensing Centre (NRSC / Bhuvan)",
                organization="National Remote Sensing Centre (NRSC / ISRO)",
                source_type="RESEARCH_ORGANIZATION",
                category="EXTERNAL_DATA",
                description="Multi-temporal Sentinel-2 and Landsat-8 spectroradiometric LULC classification layers for peri-urban corridors.",
                connection_type="SATELLITE_RASTER_FEED",
                base_url="https://bhuvan.nrsc.gov.in/",
                source_page_url="https://nrsc.isro.gov.in/reports/bengaluru-lulc-2023",
                api_url="https://bhuvan.nrsc.gov.in/api/v1/lulc-matrix",
                endpoint_url="https://nrsc.isro.gov.in/reports/bengaluru-lulc-2023",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="12 Nov 2023",
                version="Sentinel-2 10m LULC Matrix",
                record_count=1,
                is_verified=True
            ),
            DataSource(
                name="BhoomiNiti Platform Relational Data Store",
                organization="BhoomiNiti Platform Engine",
                source_type="INTERNAL_PLATFORM",
                category="PLATFORM_DATA",
                description="Platform data generated inside BhoomiNiti including policy analyses, project workspaces, innovation challenges, and scenario runs.",
                connection_type="INTERNAL_SQL_STORE",
                base_url="sqlite:///bhoominiti.db",
                source_page_url="http://localhost:8000/docs",
                api_url="http://localhost:8000/api/v1/dashboard/summary",
                endpoint_url="sqlite:///bhoominiti.db",
                status="CONNECTED",
                verification_status="VERIFIED",
                last_successful_sync=datetime.datetime.utcnow(),
                data_timestamp="28 Sep 2026, 10:18 IST",
                version="v1.0.4",
                record_count=28,
                is_verified=True
            )
        ]
        db.add_all(sources)
        db.commit()

        print("Database successfully seeded with realistic Indian Land Governance data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
