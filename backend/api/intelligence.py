"""
Decision Intelligence API Endpoints
Provides AI-powered training need analysis and recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from core.database import get_db
from services.decision_intelligence_service import DecisionIntelligenceService
from models.database_models import TrainingRecommendation, User, Cluster
from api.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intelligence", tags=["Decision Intelligence"])

# Initialize service
intelligence_service = DecisionIntelligenceService()


@router.get("/analyze/cluster/{cluster_id}")
async def analyze_cluster_needs(
    cluster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze training needs for a specific cluster
    Returns AI-generated recommendations based on feedback and usage data
    """
    # Verify cluster exists
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    
    # Perform analysis
    try:
        analysis = intelligence_service.analyze_cluster_needs(db, cluster_id=cluster_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        # Save recommendations to database
        cluster_analysis = analysis[0]
        _save_recommendations(db, cluster_id, cluster_analysis)
        
        return {
            "success": True,
            "cluster_id": cluster_id,
            "cluster_name": cluster_analysis["cluster_name"],
            "analysis": cluster_analysis
        }
    
    except Exception as e:
        logger.error(f"Error analyzing cluster {cluster_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analyze/all")
async def analyze_all_clusters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze training needs across all clusters
    Returns ranked list by priority
    """
    try:
        analyses = intelligence_service.analyze_cluster_needs(db)
        
        # Save all recommendations
        for analysis in analyses:
            _save_recommendations(db, analysis["cluster_id"], analysis)
        
        return {
            "success": True,
            "total_clusters": len(analyses),
            "analyses": analyses
        }
    
    except Exception as e:
        logger.error(f"Error analyzing all clusters: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/insights/macro")
async def get_macro_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get institution-wide or district-wide insights
    For Government Admin and Principal dashboards
    """
    # Check permissions - only admin and principal
    if current_user.role.value not in ["admin", "principal"]:
        raise HTTPException(
            status_code=403, 
            detail="Only admins and principals can access macro insights"
        )
    
    try:
        insights = intelligence_service.get_macro_insights(db)
        
        return {
            "success": True,
            "insights": insights,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error generating macro insights: {e}")
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")


@router.get("/recommendations")
async def get_recommendations(
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID"),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected"),
    priority: Optional[str] = Query(None, description="Filter by priority: high, medium, low"),
    limit: int = Query(50, le=200, description="Maximum number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get training recommendations with optional filters
    """
    query = db.query(TrainingRecommendation)
    
    # Apply filters
    if cluster_id:
        query = query.filter(TrainingRecommendation.cluster_id == cluster_id)
    
    if status:
        query = query.filter(TrainingRecommendation.status == status)
    
    if priority:
        query = query.filter(TrainingRecommendation.priority == priority)
    
    # Order by priority score (highest first)
    query = query.order_by(TrainingRecommendation.priority_score.desc())
    
    recommendations = query.limit(limit).all()
    
    # Format response
    result = []
    for rec in recommendations:
        cluster = db.query(Cluster).filter(Cluster.id == rec.cluster_id).first()
        
        result.append({
            "id": rec.id,
            "cluster_id": rec.cluster_id,
            "cluster_name": cluster.name if cluster else "Unknown",
            "type": rec.recommendation_type,
            "title": rec.title,
            "rationale": rec.rationale,
            "priority": rec.priority,
            "priority_score": rec.priority_score,
            "detected_issues": json.loads(rec.detected_issues) if rec.detected_issues else [],
            "status": rec.status,
            "created_at": rec.created_at.isoformat(),
            "reviewed_at": rec.reviewed_at.isoformat() if rec.reviewed_at else None
        })
    
    return {
        "success": True,
        "total": len(result),
        "recommendations": result
    }


@router.patch("/recommendations/{recommendation_id}/status")
async def update_recommendation_status(
    recommendation_id: int,
    status: str = Query(..., description="New status: approved, rejected, implemented"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update status of a recommendation (approve, reject, mark as implemented)
    """
    # Check permissions
    if current_user.role.value not in ["admin", "principal"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and principals can update recommendation status"
        )
    
    # Validate status
    valid_statuses = ["pending", "approved", "rejected", "implemented"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Get recommendation
    recommendation = db.query(TrainingRecommendation).filter(
        TrainingRecommendation.id == recommendation_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Update status
    recommendation.status = status
    recommendation.reviewed_at = datetime.utcnow()
    recommendation.reviewed_by = current_user.id
    
    db.commit()
    db.refresh(recommendation)
    
    return {
        "success": True,
        "message": f"Recommendation status updated to {status}",
        "recommendation": {
            "id": recommendation.id,
            "title": recommendation.title,
            "status": recommendation.status,
            "reviewed_at": recommendation.reviewed_at.isoformat()
        }
    }


@router.delete("/recommendations/{recommendation_id}")
async def delete_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a recommendation
    """
    # Check permissions
    if current_user.role.value not in ["admin", "principal"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and principals can delete recommendations"
        )
    
    recommendation = db.query(TrainingRecommendation).filter(
        TrainingRecommendation.id == recommendation_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    db.delete(recommendation)
    db.commit()
    
    return {
        "success": True,
        "message": "Recommendation deleted successfully"
    }


def _save_recommendations(db: Session, cluster_id: int, analysis: dict):
    """
    Helper function to save recommendations to database
    """
    # Delete old pending recommendations for this cluster
    db.query(TrainingRecommendation).filter(
        TrainingRecommendation.cluster_id == cluster_id,
        TrainingRecommendation.status == "pending"
    ).delete()
    
    # Save new recommendations
    for rec in analysis.get("recommendations", []):
        new_rec = TrainingRecommendation(
            cluster_id=cluster_id,
            recommendation_type=rec.get("type", "general"),
            title=rec.get("title", "Untitled"),
            rationale=rec.get("rationale", ""),
            priority=rec.get("priority", "medium"),
            priority_score=int(analysis["priority_score"]),
            detected_issues=json.dumps(analysis["detected_issues"]),
            status="pending"
        )
        db.add(new_rec)
    
    db.commit()
