from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AuditLog
from app.core.rbac import get_current_user
from app.ai.rag_engine import process_hybrid_search_rag, CONCEPT_DICTIONARY

router = APIRouter(prefix="/ai", tags=["AI Research Assistant & Statutory Intelligence"])

class AIQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class CrossQuestionRequest(BaseModel):
    parent_query: str
    cross_question: str
    target_concept: Optional[str] = None


@router.post("/query")
def query_ai_assistant(
    req: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Executes grounded hybrid search RAG query with concept definition and cross-question generation."""
    result = process_hybrid_search_rag(
        query_text=req.query,
        db=db,
        current_user_role=current_user.role,
        conversation_history=req.conversation_history
    )

    # Log execution in AuditLog
    log = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="EXECUTE",
        entity_type="RAG_AI_Query",
        entity_id="query",
        new_value=f"Query: {req.query[:100]} | Grounded: {result['answer_grounded']} | Concepts: {len(result['concept_definitions'])} | Sources: {len(result['sources'])}"
    )
    db.add(log)
    db.commit()

    return result


@router.post("/cross-question")
def handle_cross_question(
    req: CrossQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Handles analytical cross-questions and counter-queries against existing evidence."""
    combined_query = f"{req.cross_question} regarding previous topic '{req.parent_query}'"
    result = process_hybrid_search_rag(
        query_text=combined_query,
        db=db,
        current_user_role=current_user.role
    )

    return {
        "parent_query": req.parent_query,
        "cross_question": req.cross_question,
        "response": result
    }


@router.get("/concepts")
def get_statutory_land_concepts(
    term: Optional[str] = Query(None, description="Optional statutory term code filter")
):
    """Returns official statutory land governance terms, definitions, and legal frameworks."""
    if term and term.lower() in CONCEPT_DICTIONARY:
        return [CONCEPT_DICTIONARY[term.lower()]]
    
    return list(CONCEPT_DICTIONARY.values())
