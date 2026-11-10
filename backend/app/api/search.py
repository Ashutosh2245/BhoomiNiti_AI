import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, Dataset, GisLayer, AuditLog, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/search", tags=["Unified Evidence Search Engine"])

# Location and Topic Synonym Normalization Dictionary
TYPO_ALIAS_MAP = {
  "varansi": "varanasi",
  "banaras": "varanasi",
  "kashi": "varanasi",
  "bombay": "mumbai",
  "calcutta": "kolkata",
  "madras": "chennai",
  "orissa": "odisha",
  "bangalore": "bengaluru",
  "poona": "pune"
}

TOPIC_SYNONYMS = {
  "urbanization": ["urbanization", "urban", "urban sprawl", "peri-urban", "built-up", "expansion"],
  "urban": ["urban", "urbanization", "urban sprawl", "built-up"],
  "acquisition": ["acquisition", "rfctlarr", "compensation", "sia", "land acquisition"],
  "digitization": ["digitization", "dilrmp", "cadastral", "mapping", "ulpin", "bhu-aadhaar"],
  "drone": ["drone", "svamitva", "uav", "survey", "property cards"]
}

def normalize_text(text: str) -> tuple[str, list[str]]:
    raw_tokens = [w.lower() for w in re.findall(r'\w+', text) if len(w) >= 2]
    normalized_tokens = []
    expanded_terms = set()

    for token in raw_tokens:
        norm_token = TYPO_ALIAS_MAP.get(token, token)
        normalized_tokens.append(norm_token)
        expanded_terms.add(norm_token)

        if norm_token in TOPIC_SYNONYMS:
            for syn in TOPIC_SYNONYMS[norm_token]:
                expanded_terms.add(syn)

    normalized_query = " ".join(normalized_tokens)
    return normalized_query, list(expanded_terms)


@router.get("")
def execute_unified_evidence_search(
    q: str = Query(..., description="Natural language search query"),
    doc_type: str = Query(None),
    state: str = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not q or not q.strip():
        return {
            "query": "",
            "normalized_query": "",
            "total": 0,
            "status": "SUCCESS",
            "data_status": "NO_QUERY",
            "verification_summary": {
                "verified_count": 0,
                "pending_count": 0,
                "demonstration_count": 0,
                "status_label": "No Query Provided"
            },
            "results": []
        }

    normalized_query, search_terms = normalize_text(q)

    # 1. Search Documents
    doc_query = db.query(Document)
    
    # RBAC filtering
    if current_user.role in ["public_user", "innovation_partner"]:
        doc_query = doc_query.filter(Document.access_level == "PUBLIC")

    if doc_type:
        doc_query = doc_query.filter(Document.doc_type == doc_type)
    if state:
        doc_query = doc_query.filter(Document.state == state)

    docs = doc_query.all()
    matched_results = []

    for doc in docs:
        searchable_text = f"{doc.title} {doc.summary or ''} {doc.content_text or ''} {doc.tags or ''} {doc.author or ''} {doc.organization_name or ''} {doc.state or ''} {doc.district or ''} {doc.category or ''}".lower()
        
        matched_fields = []
        score = 0

        if doc.state and doc.state.lower() in searchable_text:
            matched_fields.append("state")
        if doc.district and doc.district.lower() in searchable_text:
            matched_fields.append("district")

        for term in search_terms:
            if term in searchable_text:
                score += searchable_text.count(term)
                if term in (doc.title or "").lower():
                    matched_fields.append("title")
                    score += 5
                if term in (doc.summary or "").lower():
                    matched_fields.append("summary")
                    score += 3
                if term in (doc.tags or "").lower():
                    matched_fields.append("tags")
                    score += 2

        if score > 0 or any(t in searchable_text for t in search_terms):
            matched_results.append({
                "score": score,
                "id": doc.id,
                "entity_type": "document",
                "title": doc.title,
                "doc_type": doc.doc_type,
                "type_label": doc.doc_type.replace('_', ' ').title() if doc.doc_type else "Document",
                "category": doc.category or "Land Administration",
                "organization": doc.organization_name or "Government of India",
                "author": doc.author or "BhoomiNiti Network",
                "publication_date": doc.published_date or f"{doc.publication_year}",
                "region": f"{doc.district}, {doc.state}" if (doc.district and doc.state) else (doc.state or "National"),
                "state": doc.state,
                "district": doc.district,
                "summary": doc.summary or "Verified evidence document in BhoomiNiti repository.",
                "source_name": doc.source_name or "Official Repository",
                "source_url": doc.source_url,
                "source_type": doc.source_type,
                "verification_status": doc.verification_status or "VERIFIED",
                "access_level": doc.access_level,
                "matched_fields": list(set(matched_fields)) if matched_fields else ["content"]
            })

    # Sort results by score descending
    matched_results.sort(key=lambda x: x["score"], reverse=True)
    final_results = matched_results[:limit]

    # Calculate verification breakdown
    verified_count = sum(1 for r in final_results if r["verification_status"] == "VERIFIED")
    pending_count = sum(1 for r in final_results if r["verification_status"] == "PENDING")
    demo_count = sum(1 for r in final_results if r["source_type"] == "DEMONSTRATION")

    if not final_results:
        status_label = "No Matching Evidence Found"
    elif verified_count > 0:
        status_label = "Evidence Search Results — Verified Platform Data"
    elif pending_count > 0:
        status_label = "Evidence Search Results — Verification Pending"
    else:
        status_label = "Evidence Search Results — Demonstration Data"

    # Audit log entry
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="SEARCH",
        entity_type="UnifiedEvidenceSearch",
        entity_id="q",
        new_value=f"Query: {q[:100]} | Normalized: {normalized_query} | Matches: {len(final_results)}"
    )
    db.add(log)
    db.commit()

    return {
        "query": q,
        "normalized_query": normalized_query,
        "total": len(final_results),
        "status": "SUCCESS",
        "data_status": "VERIFIED_GOVERNMENT" if verified_count > 0 else "NO_RESULTS",
        "verification_summary": {
            "verified_count": verified_count,
            "pending_count": pending_count,
            "demonstration_count": demo_count,
            "status_label": status_label
        },
        "results": final_results
    }
