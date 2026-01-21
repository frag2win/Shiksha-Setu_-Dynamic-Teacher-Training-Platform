"""
Competency API Endpoints
Handles teacher competency analysis, gap identification, and personalized recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

from core.database import get_db
from api.auth import get_current_user, require_teacher, require_principal
from models.database_models import User, UserRole, Module, ModuleCompletion
from services.competency_service import CompetencyAnalysisService

# Helper to require teacher, principal, or admin role
async def require_teacher_or_principal(current_user: User = Depends(get_current_user)) -> User:
    """Require user to be a teacher, principal, or admin"""
    if current_user.role not in [UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint requires teacher, principal, or admin role"
        )
    return current_user

router = APIRouter(prefix="/api/competencies", tags=["competencies"])

# ================== REQUEST/RESPONSE SCHEMAS ==================

class CompetencyLevelSchema(BaseModel):
    level: str
    modules_completed: int
    average_score: float
    last_activity: Optional[str]

class CompetencyGapSchema(BaseModel):
    competency_area: str
    gap_level: str
    current_level: str
    modules_completed: int
    average_score: float
    reasons: List[str]
    priority: int

class ModuleRecommendationSchema(BaseModel):
    module_id: int
    module_title: str
    competency_area: str
    gap_level: str
    average_rating: float
    cluster_name: str
    created_at: str

class CompetencyAnalysisResponse(BaseModel):
    user_id: int
    user_name: str
    overall_score: float
    competency_levels: Dict[str, CompetencyLevelSchema]
    identified_gaps: List[CompetencyGapSchema]
    progress: Dict
    recommended_modules: List[ModuleRecommendationSchema]
    last_updated: str

class ModuleCompletionCreate(BaseModel):
    module_id: int
    time_spent: int = Field(default=0, ge=0, description="Time spent in minutes")
    self_assessment_score: Optional[int] = Field(None, ge=1, le=5, description="Self-assessment score (1-5)")
    notes: Optional[str] = None

class ModuleCompletionResponse(BaseModel):
    id: int
    user_id: int
    module_id: int
    completion_status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    time_spent: int
    self_assessment_score: Optional[int]

class LeaderboardEntry(BaseModel):
    rank: int
    teacher_name: str
    competency_area: str
    level: str
    modules_completed: int
    average_score: float

# ================== ENDPOINTS ==================

@router.get("/analysis", response_model=CompetencyAnalysisResponse)
async def get_competency_analysis(
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive competency analysis for the current teacher or principal
    
    Includes:
    - Current competency levels in all areas
    - Identified competency gaps with priorities
    - Overall progress metrics
    - Personalized module recommendations
    """
    service = CompetencyAnalysisService(db)
    analysis = service.analyze_teacher_competencies(current_user.id)
    
    if "error" in analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=analysis["error"]
        )
    
    return analysis

@router.get("/analysis/{user_id}", response_model=CompetencyAnalysisResponse)
async def get_teacher_competency_analysis(
    user_id: int,
    current_user: User = Depends(require_principal),
    db: Session = Depends(get_db)
):
    """
    Get competency analysis for a specific teacher (Principal access)
    
    Allows principals to view competency analysis of teachers in their school
    """
    # Verify teacher belongs to principal's school
    teacher = db.query(User).filter(User.id == user_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher.school_id != current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access teacher from different school"
        )
    
    service = CompetencyAnalysisService(db)
    analysis = service.analyze_teacher_competencies(user_id)
    
    if "error" in analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=analysis["error"]
        )
    
    return analysis

@router.post("/modules/{module_id}/start")
async def start_module(
    module_id: int,
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db)
):
    """
    Mark a module as started by the teacher or principal
    """
    # Check if module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if already started or completed
    existing = db.query(ModuleCompletion).filter(
        ModuleCompletion.user_id == current_user.id,
        ModuleCompletion.module_id == module_id
    ).first()
    
    if existing:
        if existing.completion_status == "completed":
            return {"message": "Module already completed", "completion_id": existing.id}
        elif existing.completion_status == "in_progress":
            return {"message": "Module already in progress", "completion_id": existing.id}
    
    # Create new completion record
    completion = ModuleCompletion(
        user_id=current_user.id,
        module_id=module_id,
        completion_status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return {
        "message": "Module started successfully",
        "completion_id": completion.id,
        "started_at": completion.started_at
    }

@router.post("/modules/{module_id}/complete", response_model=ModuleCompletionResponse)
async def complete_module(
    module_id: int,
    completion_data: ModuleCompletionCreate,
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db)
):
    """
    Mark a module as completed and update competency levels
    
    This endpoint:
    1. Marks the module as completed
    2. Records time spent and self-assessment
    3. Updates teacher's competency levels
    4. Identifies any new gaps or progress
    """
    # Check if module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Get or create completion record
    completion = db.query(ModuleCompletion).filter(
        ModuleCompletion.user_id == current_user.id,
        ModuleCompletion.module_id == module_id
    ).first()
    
    if not completion:
        completion = ModuleCompletion(
            user_id=current_user.id,
            module_id=module_id,
            started_at=datetime.utcnow()
        )
        db.add(completion)
    
    # Update completion record
    completion.completion_status = "completed"
    completion.completed_at = datetime.utcnow()
    completion.time_spent = completion_data.time_spent
    completion.self_assessment_score = completion_data.self_assessment_score
    completion.notes = completion_data.notes
    
    db.commit()
    db.refresh(completion)
    
    # Update competency levels
    service = CompetencyAnalysisService(db)
    service.update_competency_on_completion(
        current_user.id, 
        module_id, 
        completion_data.self_assessment_score
    )
    
    return completion

@router.get("/recommendations")
async def get_personalized_recommendations(
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get personalized module recommendations based on competency gaps
    
    Returns modules that will help address the teacher's current competency gaps,
    prioritized by gap severity and module quality
    """
    service = CompetencyAnalysisService(db)
    analysis = service.analyze_teacher_competencies(current_user.id)
    
    if "error" in analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=analysis["error"]
        )
    
    recommendations = analysis.get("recommended_modules", [])[:limit]
    
    return {
        "total_recommendations": len(recommendations),
        "recommendations": recommendations,
        "based_on_gaps": [gap["competency_area"] for gap in analysis.get("identified_gaps", [])]
    }

@router.get("/leaderboard")
async def get_competency_leaderboard(
    competency_area: Optional[str] = Query(None, description="Filter by specific competency area"),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard of top performing teachers in competency areas
    
    Can be filtered by specific competency area or show overall performance
    """
    service = CompetencyAnalysisService(db)
    leaderboard = service.get_competency_leaderboard(competency_area, limit)
    
    return {
        "competency_area": competency_area or "All",
        "leaderboard": leaderboard
    }

@router.get("/progress")
async def get_competency_progress(
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db)
):
    """
    Get detailed competency progress for the current teacher or principal
    
    Shows progress over time, completion rates, and trends
    """
    service = CompetencyAnalysisService(db)
    analysis = service.analyze_teacher_competencies(current_user.id)
    
    if "error" in analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=analysis["error"]
        )
    
    return {
        "overall_score": analysis.get("overall_score", 0),
        "progress": analysis.get("progress", {}),
        "competency_levels": analysis.get("competency_levels", {}),
        "total_gaps": len(analysis.get("identified_gaps", []))
    }

@router.get("/areas")
async def get_competency_areas():
    """
    Get list of all competency areas and their sub-skills
    
    Useful for frontend to show available competencies and their details
    """
    from services.competency_service import COMPETENCY_AREAS
    
    return {
        "competency_areas": [
            {
                "name": area,
                "sub_skills": skills,
                "description": f"Skills related to {area.lower()}"
            }
            for area, skills in COMPETENCY_AREAS.items()
        ]
    }

@router.get("/completions")
async def get_module_completions(
    current_user: User = Depends(require_teacher_or_principal),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, description="Filter by status: not_started, in_progress, completed")
):
    """
    Get all module completions for the current teacher or principal
    
    Can filter by completion status
    """
    query = db.query(ModuleCompletion).filter(
        ModuleCompletion.user_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(ModuleCompletion.completion_status == status_filter)
    
    completions = query.order_by(ModuleCompletion.started_at.desc()).all()
    
    result = []
    for comp in completions:
        module = db.query(Module).filter(Module.id == comp.module_id).first()
        result.append({
            "id": comp.id,
            "module_id": comp.module_id,
            "module_title": module.title if module else "Unknown",
            "completion_status": comp.completion_status,
            "started_at": comp.started_at.isoformat() if comp.started_at else None,
            "completed_at": comp.completed_at.isoformat() if comp.completed_at else None,
            "time_spent": comp.time_spent,
            "self_assessment_score": comp.self_assessment_score
        })
    
    return {
        "total_completions": len(result),
        "completions": result
    }
