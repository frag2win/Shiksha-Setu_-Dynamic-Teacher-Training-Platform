"""
AI Decision Intelligence Service
Analyzes feedback, cluster metadata, and module usage to recommend training needs
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from models.database_models import Cluster, Module, Feedback, Manual
from groq import Groq
from core.config import settings
import logging
import json

logger = logging.getLogger(__name__)


class DecisionIntelligenceService:
    """
    AI-powered service to detect training needs and recommend interventions
    """
    
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"
    
    def analyze_cluster_needs(
        self, 
        db: Session, 
        cluster_id: Optional[int] = None
    ) -> List[Dict]:
        """
        Analyze training needs for a specific cluster or all clusters
        Returns ranked list of training priorities
        """
        if cluster_id:
            clusters = db.query(Cluster).filter(Cluster.id == cluster_id).all()
        else:
            clusters = db.query(Cluster).all()
        
        recommendations = []
        
        for cluster in clusters:
            needs = self._analyze_single_cluster(db, cluster)
            recommendations.append(needs)
        
        # Sort by priority score
        recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return recommendations
    
    def _analyze_single_cluster(self, db: Session, cluster: Cluster) -> Dict:
        """
        Analyze a single cluster's training needs
        """
        # Get feedback data
        feedback_data = self._get_cluster_feedback(db, cluster.id)
        
        # Get module usage patterns
        usage_data = self._get_cluster_usage(db, cluster.id)
        
        # Detect patterns and issues
        issues = self._detect_issues(feedback_data, usage_data, cluster)
        
        # Calculate priority score
        priority_score = self._calculate_priority(issues, cluster)
        
        # Generate AI recommendations
        recommendations = self._generate_recommendations(
            cluster, 
            issues, 
            feedback_data
        )
        
        return {
            "cluster_id": cluster.id,
            "cluster_name": cluster.name,
            "priority_score": priority_score,
            "detected_issues": issues,
            "recommendations": recommendations,
            "feedback_summary": feedback_data["summary"],
            "last_analyzed": datetime.utcnow().isoformat()
        }
    
    def _get_cluster_feedback(self, db: Session, cluster_id: int) -> Dict:
        """
        Aggregate feedback for cluster modules
        """
        # Get all modules for this cluster
        modules = db.query(Module).filter(Module.cluster_id == cluster_id).all()
        module_ids = [m.id for m in modules]
        
        if not module_ids:
            return {
                "total_feedback": 0,
                "avg_rating": 0,
                "low_rated_count": 0,
                "high_rated_count": 0,
                "common_issues": [],
                "summary": "No feedback data available"
            }
        
        # Get feedback
        feedbacks = db.query(Feedback).filter(
            Feedback.module_id.in_(module_ids)
        ).all()
        
        if not feedbacks:
            return {
                "total_feedback": 0,
                "avg_rating": 0,
                "low_rated_count": 0,
                "high_rated_count": 0,
                "common_issues": [],
                "summary": "No feedback received yet"
            }
        
        # Calculate metrics
        total = len(feedbacks)
        avg_rating = sum(f.rating for f in feedbacks) / total
        low_rated = sum(1 for f in feedbacks if f.rating <= 2)
        high_rated = sum(1 for f in feedbacks if f.rating >= 4)
        
        # Extract common issues from comments
        comments = [f.comment for f in feedbacks if f.comment]
        common_issues = self._extract_common_issues(comments)
        
        summary = f"{total} feedback responses, avg rating {avg_rating:.1f}/5"
        
        return {
            "total_feedback": total,
            "avg_rating": avg_rating,
            "low_rated_count": low_rated,
            "high_rated_count": high_rated,
            "common_issues": common_issues,
            "summary": summary,
            "recent_comments": comments[-5:] if comments else []
        }
    
    def _get_cluster_usage(self, db: Session, cluster_id: int) -> Dict:
        """
        Get module usage patterns for cluster
        """
        # Count modules created
        module_count = db.query(Module).filter(
            Module.cluster_id == cluster_id
        ).count()
        
        # Get recent module creation dates
        recent_modules = db.query(Module).filter(
            Module.cluster_id == cluster_id
        ).order_by(desc(Module.created_at)).limit(10).all()
        
        # Calculate activity level
        if recent_modules:
            latest_activity = recent_modules[0].created_at
            days_since_activity = (datetime.utcnow() - latest_activity).days
        else:
            days_since_activity = 999
        
        return {
            "total_modules": module_count,
            "days_since_last_activity": days_since_activity,
            "recent_module_count": len(recent_modules),
            "is_active": days_since_activity < 30
        }
    
    def _detect_issues(
        self, 
        feedback_data: Dict, 
        usage_data: Dict, 
        cluster: Cluster
    ) -> List[Dict]:
        """
        Detect potential training issues based on data
        """
        issues = []
        
        # Issue 1: Low engagement
        if usage_data["days_since_last_activity"] > 60:
            issues.append({
                "type": "low_engagement",
                "severity": "high",
                "description": "No recent module activity (60+ days)",
                "impact": "Training may be stalled"
            })
        
        # Issue 2: Low satisfaction
        if feedback_data["avg_rating"] < 3.0 and feedback_data["total_feedback"] > 3:
            issues.append({
                "type": "low_satisfaction",
                "severity": "high",
                "description": f"Low average rating: {feedback_data['avg_rating']:.1f}/5",
                "impact": "Training content may not be relevant"
            })
        
        # Issue 3: Infrastructure challenges
        if cluster.infrastructure_level.lower() == "low":
            issues.append({
                "type": "infrastructure_constraint",
                "severity": "medium",
                "description": "Low infrastructure level reported",
                "impact": "Need activity-based, low-tech training"
            })
        
        # Issue 4: Language barriers
        if cluster.primary_language.lower() not in ["english", "hindi"]:
            issues.append({
                "type": "language_need",
                "severity": "medium",
                "description": f"Primary language: {cluster.primary_language}",
                "impact": "Translation needed for better comprehension"
            })
        
        # Issue 5: Specific challenges mentioned
        if cluster.specific_challenges:
            issues.append({
                "type": "reported_challenge",
                "severity": "medium",
                "description": cluster.specific_challenges,
                "impact": "Custom training needed"
            })
        
        return issues
    
    def _calculate_priority(self, issues: List[Dict], cluster: Cluster) -> float:
        """
        Calculate priority score (0-100)
        Higher score = more urgent
        """
        score = 0.0
        
        # Weight by severity
        for issue in issues:
            if issue["severity"] == "high":
                score += 30
            elif issue["severity"] == "medium":
                score += 15
            else:
                score += 5
        
        # Boost by teacher count (more teachers = higher priority)
        teacher_factor = min(cluster.total_teachers / 100, 1.0) * 20
        score += teacher_factor
        
        # Cap at 100
        return min(score, 100.0)
    
    def _extract_common_issues(self, comments: List[str]) -> List[str]:
        """
        Extract common themes from feedback comments using simple keyword matching
        """
        if not comments:
            return []
        
        # Common issue keywords
        issue_keywords = {
            "not_practical": ["not practical", "can't implement", "difficult to apply"],
            "too_complex": ["too complex", "hard to understand", "complicated"],
            "needs_resources": ["no resources", "missing materials", "need equipment"],
            "language_barrier": ["language", "translate", "hindi", "local language"],
            "time_constraint": ["no time", "too long", "busy"]
        }
        
        found_issues = []
        comments_lower = [c.lower() for c in comments]
        
        for issue_type, keywords in issue_keywords.items():
            if any(keyword in comment for comment in comments_lower for keyword in keywords):
                found_issues.append(issue_type.replace("_", " ").title())
        
        return found_issues[:3]  # Return top 3
    
    def _generate_recommendations(
        self, 
        cluster: Cluster, 
        issues: List[Dict],
        feedback_data: Dict
    ) -> List[Dict]:
        """
        Generate AI-powered training recommendations
        """
        # Build context for AI
        context = {
            "cluster_name": cluster.name,
            "geographic_type": cluster.geographic_type,
            "primary_language": cluster.primary_language,
            "infrastructure_level": cluster.infrastructure_level,
            "challenges": cluster.specific_challenges,
            "total_teachers": cluster.total_teachers,
            "issues": issues,
            "feedback_summary": feedback_data["summary"],
            "common_issues": feedback_data["common_issues"]
        }
        
        # Generate AI recommendations
        try:
            prompt = self._build_recommendation_prompt(context)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a DIET/SCERT institutional planning assistant. 
Your role is to analyze cluster data and recommend specific training interventions.

FORMAT YOUR RESPONSE AS JSON:
{
  "recommendations": [
    {
      "type": "training_module",
      "title": "Specific topic name",
      "rationale": "Why this is needed",
      "priority": "high/medium/low"
    }
  ]
}

Keep recommendations practical, specific, and aligned with NEP 2020."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse AI response
            ai_output = response.choices[0].message.content.strip()
            
            # Try to extract JSON
            if "{" in ai_output and "}" in ai_output:
                json_start = ai_output.index("{")
                json_end = ai_output.rindex("}") + 1
                json_str = ai_output[json_start:json_end]
                parsed = json.loads(json_str)
                return parsed.get("recommendations", [])
            
            # Fallback: return generic recommendations
            return self._fallback_recommendations(issues)
            
        except Exception as e:
            logger.error(f"Error generating AI recommendations: {e}")
            return self._fallback_recommendations(issues)
    
    def _build_recommendation_prompt(self, context: Dict) -> str:
        """
        Build prompt for AI recommendation generation
        """
        prompt = f"""Analyze this cluster and recommend specific training modules:

CLUSTER PROFILE:
- Name: {context['cluster_name']}
- Type: {context['geographic_type']}
- Language: {context['primary_language']}
- Infrastructure: {context['infrastructure_level']}
- Teachers: {context['total_teachers']}
- Challenges: {context['challenges']}

DETECTED ISSUES:
"""
        for issue in context['issues']:
            prompt += f"- {issue['type']}: {issue['description']}\n"
        
        prompt += f"\nFEEDBACK: {context['feedback_summary']}\n"
        
        if context['common_issues']:
            prompt += f"COMMON CONCERNS: {', '.join(context['common_issues'])}\n"
        
        prompt += """
Based on this data, recommend 2-3 specific training modules that would address the most urgent needs.
Focus on practical, classroom-applicable topics."""
        
        return prompt
    
    def _fallback_recommendations(self, issues: List[Dict]) -> List[Dict]:
        """
        Fallback recommendations when AI fails
        """
        recommendations = []
        
        for issue in issues[:3]:
            if issue["type"] == "low_engagement":
                recommendations.append({
                    "type": "engagement_boost",
                    "title": "Quick Win Activities - Building Teacher Confidence",
                    "rationale": "Address low engagement with easy-to-implement activities",
                    "priority": "high"
                })
            elif issue["type"] == "low_satisfaction":
                recommendations.append({
                    "type": "relevance_check",
                    "title": "Contextualizing Standard Content",
                    "rationale": "Improve satisfaction by making training more relevant",
                    "priority": "high"
                })
            elif issue["type"] == "infrastructure_constraint":
                recommendations.append({
                    "type": "low_resource_training",
                    "title": "Zero-Cost Teaching Strategies",
                    "rationale": "Training designed for low-infrastructure contexts",
                    "priority": "medium"
                })
        
        if not recommendations:
            recommendations.append({
                "type": "general",
                "title": "Classroom Management Fundamentals",
                "rationale": "Core skill applicable to all contexts",
                "priority": "medium"
            })
        
        return recommendations
    
    def get_macro_insights(self, db: Session) -> Dict:
        """
        Generate institution-wide or district-wide insights
        """
        all_clusters = self.analyze_cluster_needs(db)
        
        # Aggregate metrics
        total_clusters = len(all_clusters)
        high_priority = sum(1 for c in all_clusters if c["priority_score"] >= 60)
        avg_priority = sum(c["priority_score"] for c in all_clusters) / total_clusters if total_clusters > 0 else 0
        
        # Most common issues across clusters
        all_issues = []
        for cluster in all_clusters:
            all_issues.extend([i["type"] for i in cluster["detected_issues"]])
        
        from collections import Counter
        issue_counts = Counter(all_issues)
        top_issues = issue_counts.most_common(5)
        
        return {
            "total_clusters": total_clusters,
            "high_priority_clusters": high_priority,
            "average_priority_score": round(avg_priority, 1),
            "top_systemic_issues": [
                {"issue": issue, "cluster_count": count} 
                for issue, count in top_issues
            ],
            "clusters_needing_attention": [
                {
                    "id": c["cluster_id"],
                    "name": c["cluster_name"],
                    "score": c["priority_score"]
                }
                for c in all_clusters[:5]  # Top 5
            ]
        }
