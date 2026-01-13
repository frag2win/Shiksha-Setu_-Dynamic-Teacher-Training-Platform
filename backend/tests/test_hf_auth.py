"""
Quick authentication test for HuggingFace
Verifies token is valid without downloading large models
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("HuggingFace Authentication Test")
print("=" * 50)
print()

try:
    from huggingface_hub import login, whoami
    
    token = os.getenv("HUGGINGFACE_TOKEN")
    if not token:
        print("✗ HUGGINGFACE_TOKEN not found in .env")
        exit(1)
    
    print("Logging in to HuggingFace...")
    login(token=token)
    
    print("✓ Authentication successful!")
    print()
    
    # Get user info
    user_info = whoami()
    print(f"Username: {user_info.get('name', 'N/A')}")
    print(f"Account Type: {user_info.get('type', 'N/A')}")
    print()
    
    # Check model access
    from huggingface_hub import model_info
    print("Checking IndicTrans2 model access...")
    
    try:
        info = model_info("ai4bharat/indictrans2-en-indic-1B", token=token)
        print("✓ You have access to IndicTrans2 model!")
        print(f"  Model ID: {info.id}")
        print(f"  Downloads: {info.downloads:,}")
        print(f"  Model Size: ~4.5GB")
        print()
        print("Note: Full model download will take 5-15 minutes")
        print("The model will be cached for future use")
        
    except Exception as e:
        print(f"✗ Cannot access model: {e}")
        print()
        print("Please request access at:")
        print("https://huggingface.co/ai4bharat/indictrans2-en-indic-1B")
        
except ImportError:
    print("✗ huggingface-hub not installed")
    print("Install: pip install huggingface-hub")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
