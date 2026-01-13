"""
Fixed IndicTrans2 translation test with proper API usage
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

print("IndicTrans2 Translation Test (Fixed)")
print("=" * 50)
print()

# Check dependencies
try:
    print("Checking dependencies...")
    import transformers
    import torch
    print("✓ All packages installed")
    print(f"  - transformers: {transformers.__version__}")
    print(f"  - torch: {torch.__version__}")
    print()
except ImportError as e:
    print(f"✗ Missing: {e}")
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

# Import translation service
print("Loading IndicTrans2 model...")
try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    from IndicTransToolkit import IndicProcessor
    
    # Initialize processor for proper text preprocessing
    ip = IndicProcessor(inference=True)
    
    # Load model and tokenizer
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
    
    # Test 1: English to Hindi
    print("Test 1: English to Hindi")
    print("-" * 50)
    src_lang = "eng_Latn"
    tgt_lang = "hin_Deva"
    input_text = "Hello, how are you?"
    
    print(f"Input ({src_lang}): {input_text}")
    
    # Preprocess
    batch = ip.preprocess_batch([input_text], src_lang=src_lang, tgt_lang=tgt_lang)
    
    # Tokenize
    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True
    )
    
    # Generate
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1
        )
    
    # Decode
    with tokenizer.as_target_tokenizer():
        generated_tokens = tokenizer.batch_decode(
            generated_tokens.detach().cpu().tolist(),
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )
    
    # Postprocess
    translations = ip.postprocess_batch(generated_tokens, lang=tgt_lang)
    
    print(f"Output ({tgt_lang}): {translations[0]}")
    print()
    
    # Test 2: English to Marathi
    print("Test 2: English to Marathi")
    print("-" * 50)
    src_lang = "eng_Latn"
    tgt_lang = "mar_Deva"
    input_text = "Welcome to the teacher training platform"
    
    print(f"Input ({src_lang}): {input_text}")
    
    # Preprocess
    batch = ip.preprocess_batch([input_text], src_lang=src_lang, tgt_lang=tgt_lang)
    
    # Tokenize
    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True
    )
    
    # Generate
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1
        )
    
    # Decode
    with tokenizer.as_target_tokenizer():
        generated_tokens = tokenizer.batch_decode(
            generated_tokens.detach().cpu().tolist(),
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )
    
    # Postprocess
    translations = ip.postprocess_batch(generated_tokens, lang=tgt_lang)
    
    print(f"Output ({tgt_lang}): {translations[0]}")
    print()
    
    print("✓ SUCCESS: Translation working!")
    print()
    print("Supported Languages:")
    langs = ["Hindi (hin_Deva)", "Marathi (mar_Deva)", "Bengali (ben_Beng)", 
             "Telugu (tel_Telu)", "Tamil (tam_Taml)", "Gujarati (guj_Gujr)", 
             "Kannada (kan_Knda)", "Malayalam (mal_Mlym)", "Punjabi (pan_Guru)", 
             "Urdu (urd_Arab)", "Odia (ori_Orya)"]
    for lang in langs:
        print(f"  - {lang}")
    
except ImportError as e:
    print(f"✗ Missing package: {e}")
    print()
    print("Install IndicTransToolkit:")
    print("pip install git+https://github.com/VarunGumma/IndicTransToolkit.git")
    sys.exit(1)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
