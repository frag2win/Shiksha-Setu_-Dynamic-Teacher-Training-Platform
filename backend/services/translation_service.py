"""
Translation service using Google Translate (via deep-translator)
Simple, reliable, and supports all Indian languages
With proper Unicode normalization for Devanagari and other scripts
"""

from deep_translator import GoogleTranslator
from typing import List, Dict
import unicodedata
import logging

logger = logging.getLogger(__name__)

class TranslationService:
    """
    Translation service using Google Translate
    Supports all Indian languages and more
    """
    
    # Language mappings for Google Translate
    LANGUAGE_CODES = {
        "english": "en",
        "hindi": "hi",
        "marathi": "mr",
        "bengali": "bn",
        "telugu": "te",
        "tamil": "ta",
        "gujarati": "gu",
        "kannada": "kn",
        "malayalam": "ml",
        "punjabi": "pa",
        "urdu": "ur",
        "odia": "or"
    }
    
    def __init__(self):
        self.supported_languages = list(self.LANGUAGE_CODES.keys())
        logger.info("Translation service initialized with Google Translate")
    
    def _normalize_indic_text(self, text: str) -> str:
        """
        Normalize Indian language text to prevent character splitting.
        Uses NFC normalization to keep combined characters together.
        """
        if not text:
            return text
        
        # Normalize to NFC (Canonical Composition) - keeps Devanagari/other scripts together
        normalized = unicodedata.normalize('NFC', text)
        
        # Clean up any problematic zero-width characters
        # Keep ZWJ (needed for conjuncts) but remove others
        cleaned = ""
        for char in normalized:
            code_point = ord(char)
            # Keep Zero Width Joiner (0x200D) for proper conjuncts
            if code_point == 0x200D:
                cleaned += char
            # Remove problematic zero-width chars
            elif code_point in (0x200B, 0x200C, 0xFEFF):
                continue
            else:
                cleaned += char
        
        return cleaned
    
    def translate(
        self, 
        text: str, 
        target_language: str = "hindi",
        source_language: str = "english"
    ) -> str:
        """
        Translate text from source to target language
        
        Args:
            text: Text to translate
            target_language: Target language (hindi, marathi, etc.)
            source_language: Source language (default: english)
        
        Returns:
            Translated text or original text if translation fails
        """
        
        # Normalize language names
        target_language = target_language.lower()
        source_language = source_language.lower()
        
        # If target is English, return as-is
        if target_language == "english":
            return text
        
        # Check if language is supported
        if target_language not in self.supported_languages:
            logger.warning(f"Language '{target_language}' not supported. Returning original text.")
            return text
        
        try:
            # Get language codes
            src_code = self.LANGUAGE_CODES.get(source_language, "en")
            tgt_code = self.LANGUAGE_CODES.get(target_language)
            
            if not tgt_code:
                logger.error(f"Unsupported target language: {target_language}")
                return text
            
            # Translate using Google Translate
            translator = GoogleTranslator(source=src_code, target=tgt_code)
            translated = translator.translate(text)
            
            # Normalize the translated text to prevent character splitting
            normalized = self._normalize_indic_text(translated)
            
            logger.info(f"Successfully translated text from {source_language} to {target_language}")
            return normalized
            
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            logger.warning("Returning original text")
            return text
    
    def batch_translate(
        self,
        texts: List[str],
        target_language: str = "hindi",
        source_language: str = "english"
    ) -> List[str]:
        """
        Translate multiple texts
        
        Args:
            texts: List of texts to translate
            target_language: Target language
            source_language: Source language
        
        Returns:
            List of translated texts
        """
        return [
            self.translate(text, target_language, source_language)
            for text in texts
        ]
    
    def get_supported_languages(self) -> Dict[str, str]:
        """
        Get list of supported languages with their codes
        
        Returns:
            Dictionary of language names to codes
        """
        return self.LANGUAGE_CODES.copy()
    
    def is_language_supported(self, language: str) -> bool:
        """
        Check if a language is supported
        
        Args:
            language: Language name (e.g., "hindi", "marathi")
        
        Returns:
            True if language is supported, False otherwise
        """
        return language.lower() in self.LANGUAGE_CODES


# Service instance
_translation_service = None

def get_translation_service() -> TranslationService:
    """Get singleton instance of translation service"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
