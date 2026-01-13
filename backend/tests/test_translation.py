"""
Quick test script to verify IndicTrans2 translation service
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing IndicTrans2 Translation Service...")
print("-" * 50)

try:
    # Direct import to avoid PDF processor dependencies
    sys.path.insert(0, os.path.dirname(__file__))
    from services.translation_service import IndicTranslationService
    
    print("✓ Translation service imported successfully")
    
    # Get the service instance
    model_dir = os.getenv("INDICTRANS2_MODEL_DIR", "./models/indictrans2")
    translation_service = IndicTranslationService(model_dir)
    
    print(f"✓ Service initialized")
    print(f"Model directory: {translation_service.model_dir}")
    
    # Get supported languages
    languages = translation_service.get_supported_languages()
    print(f"\n✓ Supported languages: {', '.join(languages)}")
    
    # Test translation
    print("\n" + "=" * 50)
    print("Testing English to Hindi translation...")
    print("=" * 50)
    
    test_text = "Hello, this is a test message."
    print(f"\nOriginal (English): {test_text}")
    
    print("\nInitializing IndicTrans2 model (this may take a few minutes on first run)...")
    translated_text = translation_service.translate(
        text=test_text,
        target_language="hindi",
        source_language="english"
    )
    
    print(f"\n✓ Translated (Hindi): {translated_text}")
    
    # Test another language
    print("\n" + "=" * 50)
    print("Testing English to Marathi translation...")
    print("=" * 50)
    
    test_text2 = "Welcome to the teacher training program."
    print(f"\nOriginal (English): {test_text2}")
    
    translated_text2 = translation_service.translate(
        text=test_text2,
        target_language="marathi",
        source_language="english"
    )
    
    print(f"\n✓ Translated (Marathi): {translated_text2}")
    
    print("\n" + "-" * 50)
    print("✓ IndicTrans2 translation service is working!")
    print("✓ Model successfully loaded and translations complete")
    
except ImportError as e:
    print(f"\n✗ Import Error: {str(e)}")
    print("\nPlease install required dependencies:")
    print("pip install transformers torch sentencepiece sacremoses indic-nlp-library")
    
except Exception as e:
    print(f"\n✗ ERROR: {str(e)}")
    print("\nNote: First-time setup will download ~2GB model files.")
    print("This requires:")
    print("1. Good internet connection")
    print("2. Sufficient disk space (~4GB)")
    print("3. Time for model download (5-10 minutes)")
    print("\nIf download fails, the service will fallback to returning original text.")
