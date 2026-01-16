from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from core.database import get_db
from models.database_models import Module, Manual, Cluster
from schemas.api_schemas import (
    ModuleResponse,
    GenerateModuleRequest,
    FeedbackCreate,
    FeedbackResponse,
)
from services.rag_engine import RAGEngine
from services.ai_engine import AIAdaptationEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/modules", tags=["Modules"])

rag_engine = RAGEngine()
ai_engine = AIAdaptationEngine()


@router.post(
    "/generate",
    response_model=ModuleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_module(
    request: GenerateModuleRequest,
    db: Session = Depends(get_db),
):
    """
    Generate an adapted training module for a specific cluster.
    This version AUTO-INDEXES manuals if required.
    """

    # ─────────────────────────────────────────
    # 1️⃣ Validate manual
    # ─────────────────────────────────────────
    manual = db.query(Manual).filter(Manual.id == request.manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {request.manual_id} not found",
        )

    # 🔥 Force refresh (SQLite safety)
    db.refresh(manual)

    # ─────────────────────────────────────────
    # 2️⃣ Auto-index manual if not indexed
    # ─────────────────────────────────────────
    if not manual.indexed:
        logger.info(f"Manual {manual.id} not indexed. Indexing now...")

        from services.manual_service import extract_chunks_from_manual

        chunks = extract_chunks_from_manual(manual)

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text chunks extracted from manual",
            )

        success = rag_engine.index_manual(manual.id, chunks)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to index manual into vector store",
            )

        manual.indexed = True
        db.commit()
        db.refresh(manual)

    # ─────────────────────────────────────────
    # 3️⃣ Validate cluster
    # ─────────────────────────────────────────
    cluster = db.query(Cluster).filter(Cluster.id == request.cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {request.cluster_id} not found",
        )

    try:
        # ─────────────────────────────────────────
        # 4️⃣ Retrieve context using RAG
        # ─────────────────────────────────────────
        logger.info(f"Retrieving context for topic: {request.topic}")

        original_content = rag_engine.get_context_for_topic(
            topic=request.topic,
            manual_id=request.manual_id,
            max_chunks=3,
        )

        if not original_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No relevant content found for topic '{request.topic}'",
            )

        # ─────────────────────────────────────────
        # 5️⃣ Build cluster profile
        # ─────────────────────────────────────────
        cluster_profile = {
            "name": cluster.name,
            "region_type": cluster.region_type,
            "language": cluster.language,
            "infrastructure_constraints": cluster.infrastructure_constraints
            or "None specified",
            "key_issues": cluster.key_issues or "None specified",
            "grade_range": cluster.grade_range or "Not specified",
        }

        # ─────────────────────────────────────────
        # 6️⃣ Generate adapted content using AI
        # ─────────────────────────────────────────
        logger.info(f"Generating adapted content for cluster: {cluster.name}")

        adaptation_result = await ai_engine.adapt_content(
            source_content=original_content,
            cluster_profile=cluster_profile,
            topic=request.topic,
        )

        # ─────────────────────────────────────────
        # 7️⃣ Save module to DB
        # ─────────────────────────────────────────
        module = Module(
            title=request.topic,
            manual_id=request.manual_id,
            cluster_id=request.cluster_id,
            original_content=original_content[:5000],
            adapted_content=adaptation_result["adapted_content"],
            language=cluster.language,
            approved=False,
        )

        db.add(module)
        db.commit()
        db.refresh(module)

        logger.info(f"Module generated successfully with ID: {module.id}")
        return module

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error generating module")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating module: {str(e)}",
        )


# ─────────────────────────────────────────
# LIST MODULES
# ─────────────────────────────────────────
@router.get("/", response_model=List[ModuleResponse])
async def list_modules(
    skip: int = 0,
    limit: int = 100,
    cluster_id: int | None = None,
    manual_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Module)

    if cluster_id:
        query = query.filter(Module.cluster_id == cluster_id)
    if manual_id:
        query = query.filter(Module.manual_id == manual_id)

    return query.offset(skip).limit(limit).all()


# ─────────────────────────────────────────
# GET SINGLE MODULE
# ─────────────────────────────────────────
@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found",
        )
    return module


# ─────────────────────────────────────────
# APPROVE MODULE
# ─────────────────────────────────────────
@router.patch("/{module_id}/approve")
async def approve_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found",
        )

    module.approved = True
    db.commit()
    db.refresh(module)

    return {"message": "Module approved successfully", "module_id": module_id}


# ─────────────────────────────────────────
# DELETE MODULE
# ─────────────────────────────────────────
@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found",
        )

    db.delete(module)
    db.commit()
    return None


# ─────────────────────────────────────────
# FEEDBACK
# ─────────────────────────────────────────
@router.post("/{module_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    module_id: int,
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found",
        )

    from models.database_models import Feedback

    db_feedback = Feedback(**feedback.model_dump())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)

    return db_feedback
