from typing import Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class IndicTranslationService:
    """
    Translation service using AI4Bharat's IndicTrans2
    Supports translation to Indian languages (Hindi, Marathi, Bengali, Tamil, etc.)
    """
    
    def __init__(self, model_dir: str = "./models/indictrans2"):
        self.model_dir = Path(model_dir)
        self.model = None
        self.tokenizer = None
        self.supported_languages = {
            "hindi": "hin_Deva",
            "marathi": "mar_Deva",
            "bengali": "ben_Beng",
            "tamil": "tam_Taml",
            "telugu": "tel_Telu",
            "gujarati": "guj_Gujr",
            "kannada": "kan_Knda",
            "malayalam": "mal_Mlym",
            "punjabi": "pan_Guru",
            "odia": "ory_Orya",
            "urdu": "urd_Arab",
            "english": "eng_Latn"
        }
        self.initialized = False
    
    def initialize(self):
        """
        Lazy initialization of IndicTrans2 model
        Only loads model when first translation is requested
        """
        if self.initialized:
            return
        
        try:
            from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
            
            logger.info("Loading IndicTrans2 model...")
            
            # IndicTrans2 model from HuggingFace
            model_name = "ai4bharat/indictrans2-en-indic-1B"
            
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=True,
                cache_dir=str(self.model_dir)
            )
            
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                model_name,
                trust_remote_code=True,
                cache_dir=str(self.model_dir)
            )
            
            self.initialized = True
            logger.info("IndicTrans2 model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize IndicTrans2: {str(e)}")
            logger.warning("Translation service will operate in pass-through mode")
            self.initialized = False
    
    def translate(
        self, 
        text: str, 
        target_language: str = "hindi",
        source_language: str = "english"
    ) -> str:
        """
        Translate text from source to target Indian language
        
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
            # Initialize model on first use
            if not self.initialized:
                self.initialize()
            
            # If initialization failed, return original text
            if not self.initialized or self.model is None:
                return text
            
            # Get language codes
            src_lang = self.supported_languages[source_language]
            tgt_lang = self.supported_languages[target_language]
            
            # Prepare input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            )
            
            # Generate translation
            with logger.contextvars.context():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.lang_code_to_id[tgt_lang],
                    max_length=512,
                    num_beams=5,
                    num_return_sequences=1
                )
            
            # Decode translation
            translated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            logger.info(f"Translated text to {target_language}")
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return text
    
    def batch_translate(
        self, 
        texts: list[str], 
        target_language: str = "hindi",
        source_language: str = "english"
    ) -> list[str]:
        """
        Translate multiple texts in batch for efficiency
        
        Args:
            texts: List of texts to translate
            target_language: Target language
            source_language: Source language
        
        Returns:
            List of translated texts
        """
        return [self.translate(text, target_language, source_language) for text in texts]
    
    def get_supported_languages(self) -> list[str]:
        """Get list of supported languages"""
        return list(self.supported_languages.keys())
    
    def is_language_supported(self, language: str) -> bool:
        """Check if a language is supported"""
        return language.lower() in self.supported_languages


# Singleton instance
_translation_service: Optional[IndicTranslationService] = None

def get_translation_service() -> IndicTranslationService:
    """Get or create translation service singleton"""
    global _translation_service
    if _translation_service is None:
        from core.config import settings
        _translation_service = IndicTranslationService(settings.indictrans2_model_dir)
    return _translation_service
