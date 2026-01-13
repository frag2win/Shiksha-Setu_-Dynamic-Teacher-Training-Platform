"""
Minimal test for IndicTrans2 Translation
Bypasses all service dependencies
"""

import sys
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

print("IndicTrans2 Translation Test")
print("=" * 50)
print()

# Check dependencies
try:
    print("Checking dependencies...")
    import transformers
    import torch
    import sentencepiece
    import sacremoses
    print("✓ All packages installed")
    print(f"  - transformers: {transformers.__version__}")
    print(f"  - torch: {torch.__version__}")
    print()
except ImportError as e:
    print(f"✗ Missing: {e}")
    print("Install: pip install transformers torch sentencepiece sacremoses indic-nlp-library")
    sys.exit(1)

# Login to HuggingFace
print("Authenticating with HuggingFace...")
token = os.getenv("HUGGINGFACE_TOKEN")
if not token:
    print("✗ HUGGINGFACE_TOKEN not found in .env")
    sys.exit(1)

try:
    from huggingface_hub import login
    login(token=token)
    print("✓ HuggingFace authentication successful")
    print()
except Exception as e:
    print(f"✗ Authentication failed: {e}")
    sys.exit(1)

# Load model configuration
model_dir = os.getenv("INDICTRANS2_MODEL_DIR", "./models/indictrans2")
print(f"Model Directory: {model_dir}")
print()

# Import translation service class directly
print("Loading translation service...")
try:
    # Minimal import to avoid other dependencies
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    
    # Lazy load - will download on first use
    print("Initializing IndicTrans2...")
    print("(First run will download ~2GB model)")
    print()
    
    tokenizer = AutoTokenizer.from_pretrained(
        "ai4bharat/indictrans2-en-indic-1B",
        trust_remote_code=True,
        cache_dir=model_dir
    )
    
    model = AutoModelForSeq2SeqLM.from_pretrained(
        "ai4bharat/indictrans2-en-indic-1B",
        trust_remote_code=True,
        cache_dir=model_dir
    )
    
    print("✓ Model loaded successfully!")
    print()
    
    # Test translation
    print("Test: English to Hindi")
    print("-" * 50)
    text = "Hello, how are you?"
    print(f"Input: {text}")
    
    # Set language tags properly for IndicTrans2
    # Format: "<2xx>" where xx is the language code
    tokenizer.src_lang = "eng_Latn"  # English source
    tokenizer.tgt_lang = "hin_Deva"  # Hindi target
    
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    
    # Generate translation
    generated_tokens = model.generate(
        **inputs,
        max_length=256,
        num_beams=5,
        num_return_sequences=1
    )
    
    # Decode
    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    print(f"Output: {translation}")
    print()
    
    print("✓ SUCCESS: Translation working!")
    print()
    print("Supported Languages:")
    langs = ["Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Gujarati", 
             "Kannada", "Malayalam", "Punjabi", "Urdu", "Odia"]
    for lang in langs:
        print(f"  - {lang}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
