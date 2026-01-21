"""
Competency Gap Analysis Service
Analyzes teacher competency levels and identifies gaps for personalized learning
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
import logging

from models.database_models import (
    User, UserRole, Module, Feedback, TeacherCompetency, 
    CompetencyGap, ModuleCompletion
)

logger = logging.getLogger(__name__)

# Define competency areas and their sub-skills
COMPETENCY_AREAS = {
    "Classroom Management": [
        "Behavior management",
        "Time management",
        "Creating positive learning environment",
        "Handling disruptions",
        "Student engagement"
    ],
    "Language Pedagogy": [
        "Teaching in regional languages",
        "Multilingual instruction",
        "Language acquisition strategies",
        "Vocabulary development",
        "Reading comprehension"
    ],
    "Conceptual Teaching": [
        "Making abstract concepts concrete",
        "Using real-world examples",
        "Differentiated instruction",
        "Inquiry-based learning",
        "Critical thinking"
    ],
    "Inclusive Education": [
        "Diverse learner needs",
        "Cultural sensitivity",
        "Special needs support",
        "Equity in classroom",
        "Adaptive teaching methods"
    ],
    "Assessment & Feedback": [
        "Formative assessment",
        "Summative assessment",
        "Constructive feedback",
        "Student progress tracking",
        "Self-assessment strategies"
    ]
}

# Competency level thresholds
LEVEL_THRESHOLDS = {
    "beginner": {"min_modules": 0, "min_score": 0},
    "intermediate": {"min_modules": 3, "min_score": 3.0},
    "advanced": {"min_modules": 8, "min_score": 3.5},
    "expert": {"min_modules": 15, "min_score": 4.5}
}


class CompetencyAnalysisService:
    """Service for analyzing teacher competencies and identifying gaps"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_teacher_competencies(self, user_id: int) -> Dict:
        """
        Comprehensive competency analysis for a teacher, principal, or admin
        
        Returns:
            Dictionary with current levels, gaps, and recommendations
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or user.role not in [UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.ADMIN]:
            return {"error": "User not found or invalid role"}
        
        # Get all competency data
        current_levels = self._get_current_competency_levels(user_id)
        gaps = self._identify_competency_gaps(user_id, current_levels)
        progress = self._calculate_competency_progress(user_id)
        recommendations = self._generate_module_recommendations(user_id, gaps)
        
        return {
            "user_id": user_id,
            "user_name": user.name,
            "overall_score": self._calculate_overall_score(current_levels),
            "competency_levels": current_levels,
            "identified_gaps": gaps,
            "progress": progress,
            "recommended_modules": recommendations,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _get_current_competency_levels(self, user_id: int) -> Dict:
        """Get current competency levels for a teacher"""
        competencies = {}
        
        for area in COMPETENCY_AREAS.keys():
            # Get or create competency record
            comp = self.db.query(TeacherCompetency).filter(
                TeacherCompetency.user_id == user_id,
                TeacherCompetency.competency_area == area
            ).first()
            
            if comp:
                competencies[area] = {
                    "level": comp.level,
                    "modules_completed": comp.modules_completed,
                    "average_score": comp.average_feedback_score,
                    "last_activity": comp.last_activity_date.isoformat() if comp.last_activity_date else None
                }
            else:
                # Create new competency record
                new_comp = TeacherCompetency(
                    user_id=user_id,
                    competency_area=area,
                    level="beginner"
                )
                self.db.add(new_comp)
                competencies[area] = {
                    "level": "beginner",
                    "modules_completed": 0,
                    "average_score": 0,
                    "last_activity": None
                }
        
        self.db.commit()
        return competencies
    
    def _identify_competency_gaps(self, user_id: int, current_levels: Dict) -> List[Dict]:
        """Identify competency gaps based on current levels and activity"""
        gaps = []
        
        for area, data in current_levels.items():
            level = data["level"]
            modules_completed = data["modules_completed"]
            avg_score = data["average_score"]
            
            # Check if teacher is underperforming in this area
            gap_detected = False
            gap_level = "low"
            reason = []
            
            # Gap detection logic
            if modules_completed == 0:
                gap_detected = True
                gap_level = "high"
                reason.append("No modules completed in this area")
            elif level == "beginner" and modules_completed < 3:
                gap_detected = True
                gap_level = "medium"
                reason.append("Limited practice in foundational concepts")
            elif avg_score < 3.0 and modules_completed > 0:
                gap_detected = True
                gap_level = "high"
                reason.append(f"Low feedback scores (avg: {avg_score}/5)")
            elif data["last_activity"] is None or \
                 (datetime.utcnow() - datetime.fromisoformat(data["last_activity"])).days > 60:
                gap_detected = True
                gap_level = "medium"
                reason.append("No recent activity in this competency")
            
            if gap_detected:
                # Check if gap already exists in database
                existing_gap = self.db.query(CompetencyGap).filter(
                    CompetencyGap.user_id == user_id,
                    CompetencyGap.competency_area == area,
                    CompetencyGap.status == "open"
                ).first()
                
                if not existing_gap:
                    # Create new gap record
                    new_gap = CompetencyGap(
                        user_id=user_id,
                        competency_area=area,
                        gap_level=gap_level,
                        status="open"
                    )
                    self.db.add(new_gap)
                    self.db.commit()
                
                gaps.append({
                    "competency_area": area,
                    "gap_level": gap_level,
                    "current_level": level,
                    "modules_completed": modules_completed,
                    "average_score": avg_score,
                    "reasons": reason,
                    "priority": self._calculate_gap_priority(gap_level, modules_completed)
                })
        
        # Sort by priority
        gaps.sort(key=lambda x: x["priority"], reverse=True)
        return gaps
    
    def _calculate_gap_priority(self, gap_level: str, modules_completed: int) -> int:
        """Calculate priority score for addressing a gap"""
        base_scores = {"critical": 100, "high": 75, "medium": 50, "low": 25}
        base = base_scores.get(gap_level, 25)
        
        # Increase priority if no modules completed
        if modules_completed == 0:
            base += 20
        
        return min(base, 100)
    
    def _calculate_competency_progress(self, user_id: int) -> Dict:
        """Calculate overall progress in competency development"""
        total_modules = self.db.query(ModuleCompletion).filter(
            ModuleCompletion.user_id == user_id,
            ModuleCompletion.completion_status == "completed"
        ).count()
        
        competency_counts = {}
        for area in COMPETENCY_AREAS.keys():
            comp = self.db.query(TeacherCompetency).filter(
                TeacherCompetency.user_id == user_id,
                TeacherCompetency.competency_area == area
            ).first()
            
            competency_counts[area] = comp.modules_completed if comp else 0
        
        return {
            "total_modules_completed": total_modules,
            "modules_per_competency": competency_counts,
            "completion_rate": self._calculate_completion_rate(user_id)
        }
    
    def _calculate_completion_rate(self, user_id: int) -> float:
        """Calculate module completion rate"""
        started = self.db.query(ModuleCompletion).filter(
            ModuleCompletion.user_id == user_id
        ).count()
        
        if started == 0:
            return 0.0
        
        completed = self.db.query(ModuleCompletion).filter(
            ModuleCompletion.user_id == user_id,
            ModuleCompletion.completion_status == "completed"
        ).count()
        
        return round((completed / started) * 100, 2)
    
    def _generate_module_recommendations(self, user_id: int, gaps: List[Dict]) -> List[Dict]:
        """Generate personalized module recommendations based on gaps"""
        recommendations = []
        
        for gap in gaps[:3]:  # Top 3 priority gaps
            area = gap["competency_area"]
            
            # Find modules tagged with this competency that user hasn't completed
            completed_module_ids = [
                mc.module_id for mc in self.db.query(ModuleCompletion).filter(
                    ModuleCompletion.user_id == user_id,
                    ModuleCompletion.completion_status == "completed"
                ).all()
            ]
            
            # Get modules with high ratings in this competency area
            relevant_modules = self.db.query(Module).filter(
                Module.module_metadata.like(f'%{area}%'),
                ~Module.id.in_(completed_module_ids) if completed_module_ids else True
            ).limit(5).all()
            
            for module in relevant_modules:
                # Calculate recommendation score
                avg_feedback = self.db.query(func.avg(Feedback.rating)).filter(
                    Feedback.module_id == module.id
                ).scalar() or 0
                
                recommendations.append({
                    "module_id": module.id,
                    "module_title": module.title,
                    "competency_area": area,
                    "gap_level": gap["gap_level"],
                    "average_rating": round(float(avg_feedback), 2),
                    "cluster_name": module.cluster.name if module.cluster else "Unknown",
                    "created_at": module.created_at.isoformat()
                })
        
        return recommendations
    
    def _calculate_overall_score(self, competency_levels: Dict) -> float:
        """Calculate overall competency score (0-100)"""
        level_scores = {"beginner": 25, "intermediate": 50, "advanced": 75, "expert": 100}
        
        scores = []
        for area, data in competency_levels.items():
            base_score = level_scores.get(data["level"], 0)
            # Adjust by feedback scores
            if data["average_score"] > 0:
                base_score = base_score * (data["average_score"] / 5.0)
            scores.append(base_score)
        
        return round(sum(scores) / len(scores), 2) if scores else 0.0
    
    def update_competency_on_completion(self, user_id: int, module_id: int, 
                                       feedback_rating: Optional[int] = None) -> None:
        """Update competency levels when a module is completed"""
        module = self.db.query(Module).filter(Module.id == module_id).first()
        if not module:
            return
        
        # Extract competency areas from module metadata
        try:
            metadata = json.loads(module.module_metadata) if module.module_metadata else {}
            competency_tags = metadata.get("competency_tags", [])
        except:
            competency_tags = []
        
        # Update each relevant competency
        for area in competency_tags:
            if area in COMPETENCY_AREAS:
                comp = self.db.query(TeacherCompetency).filter(
                    TeacherCompetency.user_id == user_id,
                    TeacherCompetency.competency_area == area
                ).first()
                
                if comp:
                    # Update statistics
                    comp.modules_completed += 1
                    comp.last_activity_date = datetime.utcnow()
                    
                    # Update average feedback score
                    if feedback_rating:
                        if comp.average_feedback_score == 0:
                            comp.average_feedback_score = feedback_rating
                        else:
                            # Running average
                            comp.average_feedback_score = (
                                (comp.average_feedback_score * (comp.modules_completed - 1) + feedback_rating) 
                                / comp.modules_completed
                            )
                    
                    # Check for level upgrade
                    new_level = self._determine_competency_level(
                        comp.modules_completed, 
                        comp.average_feedback_score
                    )
                    comp.level = new_level
                    
                    self.db.commit()
    
    def _determine_competency_level(self, modules_completed: int, avg_score: float) -> str:
        """Determine competency level based on modules completed and scores"""
        if modules_completed >= LEVEL_THRESHOLDS["expert"]["min_modules"] and \
           avg_score >= LEVEL_THRESHOLDS["expert"]["min_score"]:
            return "expert"
        elif modules_completed >= LEVEL_THRESHOLDS["advanced"]["min_modules"] and \
             avg_score >= LEVEL_THRESHOLDS["advanced"]["min_score"]:
            return "advanced"
        elif modules_completed >= LEVEL_THRESHOLDS["intermediate"]["min_modules"] and \
             avg_score >= LEVEL_THRESHOLDS["intermediate"]["min_score"]:
            return "intermediate"
        else:
            return "beginner"
    
    def get_competency_leaderboard(self, competency_area: Optional[str] = None, 
                                  limit: int = 10) -> List[Dict]:
        """Get top performing teachers in a competency area"""
        query = self.db.query(TeacherCompetency).join(User)
        
        if competency_area:
            query = query.filter(TeacherCompetency.competency_area == competency_area)
        
        top_teachers = query.order_by(
            desc(TeacherCompetency.modules_completed),
            desc(TeacherCompetency.average_feedback_score)
        ).limit(limit).all()
        
        leaderboard = []
        for i, comp in enumerate(top_teachers, 1):
            leaderboard.append({
                "rank": i,
                "teacher_name": comp.user.name,
                "competency_area": comp.competency_area,
                "level": comp.level,
                "modules_completed": comp.modules_completed,
                "average_score": comp.average_feedback_score
            })
        
        return leaderboard
