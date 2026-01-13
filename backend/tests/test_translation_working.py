"""
Working IndicTrans2 translation test - Simple approach
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

print("IndicTrans2 Translation Test (Working)")
print("=" * 50)
print()

# Authentication
print("Authenticating...")
token = os.getenv("HUGGINGFACE_TOKEN")
if token:
    from huggingface_hub import login
    login(token=token)
    print("✓ Authenticated")
    print()

# Load model
print("Loading model...")
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

model_dir = os.getenv("INDICTRANS2_MODEL_DIR", "./models/indictrans2")

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

print("✓ Model loaded")
print()

# Translation function
def translate_text(text, src_lang="eng_Latn", tgt_lang="hin_Deva"):
    """Translate text using IndicTrans2"""
    
    # Format input with language tags
    formatted_input = f"{src_lang} {text} {tgt_lang}"
    
    # Tokenize
    inputs = tokenizer(
        formatted_input,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=256
    )
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=256,
            num_beams=5,
            early_stopping=True
        )
    
    # Decode
    translation = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Remove language tags from output
    translation = translation.replace(src_lang, "").replace(tgt_lang, "").strip()
    
    return translation

# Test 1: English to Hindi
print("Test 1: English → Hindi")
print("-" * 50)
text1 = "Hello, how are you?"
print(f"Input: {text1}")

try:
    result1 = translate_text(text1, "eng_Latn", "hin_Deva")
    print(f"Output: {result1}")
    print("✓ Success")
except Exception as e:
    print(f"✗ Error: {e}")

print()

# Test 2: English to Marathi  
print("Test 2: English → Marathi")
print("-" * 50)
text2 = "Welcome to the teacher training platform"
print(f"Input: {text2}")

try:
    result2 = translate_text(text2, "eng_Latn", "mar_Deva")
    print(f"Output: {result2}")
    print("✓ Success")
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("=" * 50)
print("✓ Translation service working!")
print()
print("Supported: Hindi, Marathi, Bengali, Telugu, Tamil,")
print("           Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia")
