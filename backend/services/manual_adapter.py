"""
Manual Adapter Service
Handles AI-based adaptation of uploaded PDF manuals:
- Language detection from PDF content
- AI-generated summaries and key points
- Proper Unicode handling for Indian languages (Hindi, Marathi, etc.)
"""

import re
import unicodedata
from typing import Dict, List, Optional, Tuple
from groq import Groq
from core.config import settings
from services.translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)


class ManualAdapterService:
    """
    Service for adapting uploaded manuals with AI-generated summaries
    and key points in the same language as the source document.
    """
    
    # Unicode ranges for Indian language detection
    LANGUAGE_UNICODE_RANGES = {
        'hindi': [
            (0x0900, 0x097F),  # Devanagari
        ],
        'marathi': [
            (0x0900, 0x097F),  # Devanagari (same as Hindi)
        ],
        'bengali': [
            (0x0980, 0x09FF),  # Bengali
        ],
        'tamil': [
            (0x0B80, 0x0BFF),  # Tamil
        ],
        'telugu': [
            (0x0C00, 0x0C7F),  # Telugu
        ],
        'gujarati': [
            (0x0A80, 0x0AFF),  # Gujarati
        ],
        'kannada': [
            (0x0C80, 0x0CFF),  # Kannada
        ],
        'malayalam': [
            (0x0D00, 0x0D7F),  # Malayalam
        ],
        'punjabi': [
            (0x0A00, 0x0A7F),  # Gurmukhi
        ],
        'odia': [
            (0x0B00, 0x0B7F),  # Oriya
        ],
        'urdu': [
            (0x0600, 0x06FF),  # Arabic (Urdu uses Arabic script)
            (0x0750, 0x077F),  # Arabic Supplement
        ],
    }
    
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"
        self.translation_service = get_translation_service()
        logger.info("Manual Adapter Service initialized")
    
    def _normalize_indian_text(self, text: str) -> str:
        """
        Normalize Indian language text to prevent character splitting.
        Uses NFC normalization to keep combined characters together.
        """
        if not text:
            return text
        
        # Normalize to NFC (Canonical Composition) - keeps characters together
        normalized = unicodedata.normalize('NFC', text)
        
        # Remove any zero-width characters that might cause issues
        # But keep Zero Width Joiner (ZWJ) which is needed for some conjuncts
        cleaned = ""
        for char in normalized:
            code_point = ord(char)
            # Keep ZWJ (0x200D) but remove ZWNJ (0x200C) and other zero-width chars
            if code_point == 0x200D:  # Zero Width Joiner - keep it
                cleaned += char
            elif code_point in (0x200B, 0x200C, 0xFEFF):  # Zero width space, ZWNJ, BOM
                continue
            else:
                cleaned += char
        
        return cleaned
    
    def detect_language(self, text: str) -> str:
        """
        Detect the primary language of the text based on Unicode character analysis.
        Returns the detected language name (lowercase).
        """
        if not text:
            return "english"
        
        # Count characters in each language's Unicode range
        language_counts = {lang: 0 for lang in self.LANGUAGE_UNICODE_RANGES}
        english_count = 0
        total_alpha = 0
        
        for char in text:
            if not char.isalpha():
                continue
            
            total_alpha += 1
            code_point = ord(char)
            
            # Check if it's ASCII (English)
            if code_point < 128:
                english_count += 1
                continue
            
            # Check against Indian language ranges
            for lang, ranges in self.LANGUAGE_UNICODE_RANGES.items():
                for start, end in ranges:
                    if start <= code_point <= end:
                        language_counts[lang] += 1
                        break
        
        if total_alpha == 0:
            return "english"
        
        # Find the dominant language
        max_count = english_count
        detected_lang = "english"
        
        for lang, count in language_counts.items():
            if count > max_count:
                max_count = count
                detected_lang = lang
        
        # If Devanagari script detected, try to distinguish Hindi from Marathi
        # based on common word patterns (simplified heuristic)
        if detected_lang in ('hindi', 'marathi'):
            # Check for Marathi-specific words/patterns
            marathi_indicators = ['आहे', 'नाही', 'आणि', 'हे', 'ते', 'या', 'त्या', 'केले', 'झाले', 'असे']
            hindi_indicators = ['है', 'हैं', 'नहीं', 'और', 'यह', 'वह', 'था', 'थे', 'किया', 'हुआ']
            
            marathi_score = sum(1 for word in marathi_indicators if word in text)
            hindi_score = sum(1 for word in hindi_indicators if word in text)
            
            detected_lang = 'marathi' if marathi_score > hindi_score else 'hindi'
        
        logger.info(f"Detected language: {detected_lang} (confidence based on {max_count}/{total_alpha} chars)")
        return detected_lang
    
    def _get_language_instruction(self, language: str) -> str:
        """Get AI instruction for generating content in specific language."""
        language_names = {
            'hindi': 'Hindi (हिंदी)',
            'marathi': 'Marathi (मराठी)',
            'bengali': 'Bengali (বাংলা)',
            'tamil': 'Tamil (தமிழ்)',
            'telugu': 'Telugu (తెలుగు)',
            'gujarati': 'Gujarati (ગુજરાતી)',
            'kannada': 'Kannada (ಕನ್ನಡ)',
            'malayalam': 'Malayalam (മലയാളം)',
            'punjabi': 'Punjabi (ਪੰਜਾਬੀ)',
            'odia': 'Odia (ଓଡ଼ିଆ)',
            'urdu': 'Urdu (اردو)',
            'english': 'English',
        }
        return language_names.get(language, 'English')
    
    async def generate_adapted_content(
        self,
        extracted_text: str,
        detected_language: str,
        manual_title: str
    ) -> Dict[str, any]:
        """
        Generate AI-adapted summary and key points from manual content.
        The output will be in the same language as the source document.
        
        Args:
            extracted_text: The extracted text from the PDF
            detected_language: The detected language of the document
            manual_title: Title of the manual
            
        Returns:
            Dict with adapted_summary, key_points, and language
        """
        try:
            # Normalize the input text for proper Unicode handling
            normalized_text = self._normalize_indian_text(extracted_text)
            
            # Truncate text if too long (keep first ~8000 chars for context)
            max_chars = 8000
            if len(normalized_text) > max_chars:
                normalized_text = normalized_text[:max_chars] + "..."
            
            lang_name = self._get_language_instruction(detected_language)
            
            # Build the prompt for AI adaptation
            system_prompt = f"""You are an expert educational content adapter for Indian government teacher training programs.

CRITICAL LANGUAGE INSTRUCTION:
- The source document is in {lang_name}
- You MUST generate ALL your output in {lang_name} ONLY
- Do NOT translate to English or any other language
- Maintain the exact same language as the source content
- Use proper {lang_name} script and grammar

Your task is to:
1. Analyze the training manual content
2. Extract key learning points and concepts
3. Create a clear, concise summary
4. Identify practical teaching strategies mentioned
5. Highlight important pedagogical concepts

OUTPUT REQUIREMENTS:
- Write EVERYTHING in {lang_name}
- Use clear, simple language suitable for teachers
- Organize information in easy-to-understand format
- Keep the educational context intact"""

            user_prompt = f"""Please analyze this training manual and create an adapted summary:

MANUAL TITLE: {manual_title}

CONTENT:
\"\"\"
{normalized_text}
\"\"\"

Generate the following in {lang_name}:

1. **सारांश / Summary** (3-5 paragraphs covering the main content)

2. **मुख्य बिंदु / Key Points** (5-10 bullet points of key learning objectives)

3. **शिक्षण रणनीतियाँ / Teaching Strategies** (Practical strategies mentioned)

4. **महत्वपूर्ण अवधारणाएँ / Important Concepts** (Core pedagogical concepts)

Remember: Write ENTIRELY in {lang_name}. Do not use English unless the source is in English."""

            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent output
                max_tokens=3000,
                top_p=1,
                stream=False
            )
            
            adapted_content = response.choices[0].message.content
            
            # Normalize the output text for proper Unicode handling
            adapted_content = self._normalize_indian_text(adapted_content)
            
            # Parse key points from the response
            key_points = self._extract_key_points(adapted_content)
            
            result = {
                "adapted_summary": adapted_content,
                "key_points": key_points,
                "detected_language": detected_language,
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
            logger.info(f"Successfully generated adapted content for '{manual_title}' in {detected_language}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating adapted content: {str(e)}")
            raise Exception(f"AI adaptation failed: {str(e)}")
    
    def _extract_key_points(self, content: str) -> List[str]:
        """Extract key points from the adapted content as a list."""
        key_points = []
        
        # Look for bullet points or numbered items
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            # Match bullet points (-, *, •, numbers)
            if re.match(r'^[-*•]\s+', line):
                point = re.sub(r'^[-*•]\s+', '', line)
                if point and len(point) > 10:  # Skip very short items
                    key_points.append(self._normalize_indian_text(point))
            elif re.match(r'^\d+[.)]\s+', line):
                point = re.sub(r'^\d+[.)]\s+', '', line)
                if point and len(point) > 10:
                    key_points.append(self._normalize_indian_text(point))
        
        # If no bullet points found, try to extract sentences
        if not key_points:
            # Split by common sentence terminators including Devanagari Danda (।)
            sentences = re.split(r'[।.!?]\s+', content)
            for sentence in sentences[:10]:  # Limit to first 10
                sentence = sentence.strip()
                if len(sentence) > 20:
                    key_points.append(self._normalize_indian_text(sentence))
        
        return key_points[:10]  # Limit to 10 key points
    
    async def adapt_manual(
        self,
        file_path: str,
        extracted_text: str,
        manual_title: str
    ) -> Dict[str, any]:
        """
        Complete adaptation workflow for a manual:
        1. Detect language
        2. Normalize text
        3. Generate AI summary and key points
        
        Args:
            file_path: Path to the PDF file
            extracted_text: Pre-extracted text from PDF
            manual_title: Title of the manual
            
        Returns:
            Dict with all adaptation results
        """
        # Normalize the extracted text
        normalized_text = self._normalize_indian_text(extracted_text)
        
        # Detect language
        detected_language = self.detect_language(normalized_text)
        logger.info(f"Detected language for '{manual_title}': {detected_language}")
        
        # Generate adapted content
        adaptation_result = await self.generate_adapted_content(
            extracted_text=normalized_text,
            detected_language=detected_language,
            manual_title=manual_title
        )
        
        return {
            "detected_language": detected_language,
            "extracted_text": normalized_text,
            "adapted_summary": adaptation_result["adapted_summary"],
            "key_points": adaptation_result["key_points"],
            "tokens_used": adaptation_result.get("tokens_used", 0)
        }


# Singleton instance
_manual_adapter_service = None

def get_manual_adapter_service() -> ManualAdapterService:
    """Get singleton instance of manual adapter service"""
    global _manual_adapter_service
    if _manual_adapter_service is None:
        _manual_adapter_service = ManualAdapterService()
    return _manual_adapter_service
