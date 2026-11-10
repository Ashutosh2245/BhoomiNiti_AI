import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_db

client = TestClient(app)

def setup_module():
    seed_db()

def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "UP"

def test_documents_list():
    res = client.get("/api/v1/documents")
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_ai_query():
    res = client.post("/api/v1/ai/query", json={"query": "digital cadastral mapping dispute maharashtra"})
    assert res.status_code == 200
    data = res.json()
    assert data["answer_grounded"] is True
    assert len(data["sources"]) >= 1

def test_gis_layers():
    res = client.get("/api/v1/gis/layers")
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_gis_query_region():
    res = client.get("/api/v1/gis/query-region?state=Maharashtra")
    assert res.status_code == 200
    data = res.json()
    assert len(data["research_papers"]) >= 1

def test_indicator_update_persistence():
    # Fetch first indicator
    ind_res = client.get("/api/v1/analytics/indicators")
    ind_id = ind_res.json()[0]["id"]

    # Update indicator target_val
    update_res = client.put(f"/api/v1/analytics/indicators/{ind_id}", json={
        "name": "Updated Test Indicator Name",
        "target_val": 0.65
    })
    assert update_res.status_code == 200
    assert update_res.json()["indicator"]["target_val"] == 0.65

    # Verify persistence by fetching again from database
    verify_res = client.get(f"/api/v1/analytics/indicators/{ind_id}")
    assert verify_res.json()["target_val"] == 0.65
    assert verify_res.json()["name"] == "Updated Test Indicator Name"

def test_policy_simulation_execution():
    scenarios = client.get("/api/v1/simulations/scenarios").json()
    scenario_id = scenarios[0]["id"]

    run_res = client.post(f"/api/v1/simulations/scenarios/{scenario_id}/run")
    assert run_res.status_code == 200
    assert run_res.json()["status"] == "COMPLETED"
    assert "projected_agricultural_preservation_hectares" in run_res.json()["results"]

def test_dashboard_summary_real_db_counts():
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "research_resources" in data
    assert data["research_resources"] == 7 # Seeded documents count (including Varanasi report)
    assert data["research_papers"] == 3
    assert data["policy_documents"] == 2
    assert data["legal_documents"] == 1
    assert data["case_studies"] == 1
    assert data["datasets"] == 3
    assert data["active_projects"] == 2
    assert data["innovation_challenges"] == 1

def test_dashboard_sources_registry():
    res = client.get("/api/v1/dashboard/sources")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 5
    categories = [s["category"] for s in sources]
    assert "PLATFORM_DATA" in categories
    assert "EXTERNAL_DATA" in categories

def test_dashboard_recent_knowledge_categories():
    res_all = client.get("/api/v1/dashboard/recent-knowledge?category=All")
    assert res_all.status_code == 200
    assert len(res_all.json()["items"]) >= 5

    res_research = client.get("/api/v1/dashboard/recent-knowledge?category=Research")
    assert res_research.status_code == 200
    for item in res_research.json()["items"]:
        assert item["document_type"] == "research_paper"

    res_datasets = client.get("/api/v1/dashboard/recent-knowledge?category=Datasets")
    assert res_datasets.status_code == 200
    assert len(res_datasets.json()["items"]) >= 3

def test_source_detail_endpoint():
    res = client.get("/api/v1/sources/1")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Department of Land Resources (DoLR)"
    assert "imported_documents" in data

def test_reports_analysis_result():
    res = client.get("/api/v1/reports/analysis-result?language=en-hi")
    assert res.status_code == 200
    data = res.json()
    assert data["data_status"] == "VERIFIED_GOVERNMENT"
    assert "exec_summary_en" in data
    assert "exec_summary_hi" in data
    assert len(data["kpis"]) == 6
    assert len(data["findings"]) >= 3
    assert len(data["charts"]) >= 2
    assert "methodology_en" in data

def test_reports_generation_all_formats():
    for fmt in ["pdf", "docx", "excel", "csv", "json"]:
        gen_res = client.post("/api/v1/reports/generate", json={
            "title": f"Test {fmt.upper()} Land Governance Report",
            "language": "en-hi",
            "format": fmt
        })
        assert gen_res.status_code == 200
        data = gen_res.json()
        assert data["status"] == "COMPLETED"
        assert data["format"] == fmt
        report_id = data["report_id"]

        # Test Verification Endpoint
        verify_res = client.get(f"/api/v1/reports/{report_id}/verify")
        assert verify_res.status_code == 200
        assert verify_res.json()["authenticity_status"] == "VERIFIED_BHOOMINITI_REPORT"

        # Test Download Endpoint
        dl_res = client.get(f"/api/v1/reports/{report_id}/download")
        assert dl_res.status_code == 200



