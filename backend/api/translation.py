from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
from services.translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/translation", tags=["Translation"])

class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target_language: str = Field(..., description="Target language (hindi, marathi, bengali, etc.)")
    source_language: str = Field(default="english", description="Source language")

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str

class BatchTranslateRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1)
    target_language: str
    source_language: str = "english"

class BatchTranslateResponse(BaseModel):
    translations: List[str]
    target_language: str

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """
    Translate text to Indian language using Google Translate
    
    Supported languages: hindi, marathi, bengali, tamil, telugu, gujarati, 
    kannada, malayalam, punjabi, odia, urdu, english
    """
    try:
        translation_service = get_translation_service()
        
        # Check if language is supported
        if not translation_service.is_language_supported(request.target_language):
            supported_langs = list(translation_service.get_supported_languages().keys())
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Language '{request.target_language}' is not supported. "
                       f"Supported: {', '.join(supported_langs)}"
            )
        
        translated_text = translation_service.translate(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        return TranslateResponse(
            original_text=request.text,
            translated_text=translated_text,
            source_language=request.source_language,
            target_language=request.target_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )

@router.post("/translate/batch", response_model=BatchTranslateResponse)
async def translate_batch(request: BatchTranslateRequest):
    """Translate multiple texts in batch"""
    try:
        translation_service = get_translation_service()
        
        if not translation_service.is_language_supported(request.target_language):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Language '{request.target_language}' is not supported"
            )
        
        translations = translation_service.batch_translate(
            texts=request.texts,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        return BatchTranslateResponse(
            translations=translations,
            target_language=request.target_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch translation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch translation failed: {str(e)}"
        )

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for translation"""
    translation_service = get_translation_service()
    lang_codes = translation_service.get_supported_languages()
    return {
        "languages": list(lang_codes.keys()),
        "language_codes": lang_codes,
        "model": "Google Translate",
        "description": "Translation service for Indian languages"
    }
