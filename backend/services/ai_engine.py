from groq import Groq
from core.config import settings
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class AIAdaptationEngine:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"  # Fast and capable model
        
        # System prompt for grounded, policy-safe pedagogy
        self.system_prompt = """You are an expert teacher educator working within the Indian public education system.

You must strictly follow these rules:
1. Use ONLY the provided source material as factual grounding.
2. Do NOT invent experiments, activities, or policies not present in the source.
3. Adapt pedagogy to the given classroom constraints.
4. Ensure all suggestions are safe, low-cost, and policy-aligned.
5. Write in simple, practical language suitable for government school teachers.
6. Do NOT evaluate or judge teachers.
7. If a resource is unavailable, redesign the activity instead of suggesting purchase.

Your task is to assist DIET and SCERT administrators in creating localized teacher training modules."""
    
    def _build_context_prompt(
        self, 
        source_content: str, 
        cluster_profile: Dict,
        topic: str
    ) -> str:
        """Build the complete context prompt for adaptation"""
        
        prompt = f"""SOURCE MANUAL EXCERPT:
\"\"\"
{source_content}
\"\"\"

CLUSTER PROFILE:
- Region Type: {cluster_profile.get('region_type', 'Not specified')}
- Medium of Instruction: {cluster_profile.get('language', 'Not specified')}
- Infrastructure Constraints: {cluster_profile.get('infrastructure_constraints', 'Not specified')}
- Key Classroom Issues: {cluster_profile.get('key_issues', 'Not specified')}
- Grade Range: {cluster_profile.get('grade_range', 'Not specified')}

TASK:
Rewrite the above training content about "{topic}" into a localized, practical micro-learning module for teachers in the given cluster.

INSTRUCTIONS:
- Keep the core learning objective unchanged.
- Replace or redesign any activity that requires unavailable infrastructure.
- Use culturally and linguistically familiar examples.
- Break content into short sections:
  1. Classroom Challenge
  2. Suggested Teaching Approach
  3. Low-Resource Activity
  4. Expected Student Response
- Keep total length suitable for a 10-15 minute teacher training slot.

OUTPUT FORMAT:
Title:
Cluster Context:
Micro-Learning Module:"""
        
        return prompt
    
    async def adapt_content(
        self,
        source_content: str,
        cluster_profile: Dict,
        topic: str,
        temperature: float = 0.7
    ) -> Dict[str, str]:
        """
        Generate adapted pedagogical content
        
        Args:
            source_content: Original manual content
            cluster_profile: Cluster characteristics
            topic: Specific topic to adapt
            temperature: Model creativity (0-1)
        
        Returns:
            Dict with adapted content and metadata
        """
        try:
            # Build prompt
            user_prompt = self._build_context_prompt(source_content, cluster_profile, topic)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                max_tokens=2000,
                top_p=1,
                stream=False
            )
            
            adapted_content = response.choices[0].message.content
            
            result = {
                "adapted_content": adapted_content,
                "model": self.model,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
                "finish_reason": response.choices[0].finish_reason
            }
            
            logger.info(f"Successfully adapted content for topic: {topic}")
            return result
            
        except Exception as e:
            logger.error(f"Error adapting content: {str(e)}")
            raise Exception(f"AI adaptation failed: {str(e)}")
    
    async def validate_safety(self, content: str) -> Dict[str, any]:
        """
        Optional safety validation pass
        
        Args:
            content: Generated content to validate
        
        Returns:
            Dict with validation result and any concerns
        """
        safety_prompt = f"""Review the following teacher training module and ensure:
- No unsafe or unapproved experiments are suggested
- No policy violations are present
- No assumptions of unavailable resources
- Tone is respectful and supportive toward teachers

MODULE CONTENT:
\"\"\"
{content}
\"\"\"

Respond with:
1. SAFE or UNSAFE
2. If UNSAFE, list specific concerns
3. If concerns found, provide revised content"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a safety validator for educational content."},
                    {"role": "user", "content": safety_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            validation_result = response.choices[0].message.content
            
            return {
                "is_safe": "SAFE" in validation_result.upper()[:20],
                "validation_details": validation_result
            }
            
        except Exception as e:
            logger.error(f"Error in safety validation: {str(e)}")
            # Default to requiring review if validation fails
            return {
                "is_safe": False,
                "validation_details": f"Validation failed: {str(e)}"
            }
    
    async def tag_competencies(self, content: str) -> list:
        """
        Tag content with relevant teacher competency areas
        
        Args:
            content: Module content to analyze
        
        Returns:
            List of competency tags
        """
        competency_prompt = f"""Based on the module content below, tag this module under up to two teacher competency areas:
- Classroom Management
- Language Pedagogy
- Conceptual Teaching
- Inclusive Education
- Assessment & Feedback

Return only the tags, comma-separated.

MODULE CONTENT:
\"\"\"
{content}
\"\"\"

TAGS:"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": competency_prompt}
                ],
                temperature=0.2,
                max_tokens=50
            )
            
            tags_text = response.choices[0].message.content.strip()
            tags = [tag.strip() for tag in tags_text.split(',')]
            
            return tags[:2]  # Return max 2 tags
            
        except Exception as e:
            logger.error(f"Error tagging competencies: {str(e)}")
            return []
