"""
Quick Service Test - No Heavy Downloads
"""

print("=" * 70)
print("QUICK SERVICE TEST")
print("=" * 70)

# Test 1: Translation Service (Direct, no imports from services.__init__)
print("\n1. Testing Translation Service (Google Translate)...")
try:
    import sys
    sys.path.insert(0, '.')
    
    # Import directly to avoid services.__init__ dependencies
    from deep_translator import GoogleTranslator
    
    # Test Hindi
    translator = GoogleTranslator(source='en', target='hi')
    result = translator.translate("Welcome to Shiksha Setu")
    print(f"   English → Hindi: {result}")
    
    # Test Marathi
    translator = GoogleTranslator(source='en', target='mr')
    result = translator.translate("Teacher Training Platform")
    print(f"   English → Marathi: {result}")
    
    print("   ✓ Translation Service: WORKING")
    
except Exception as e:
    print(f"   ✗ Translation Service Failed: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 2: Database
print("\n2. Testing Database...")
try:
    from core.database import SessionLocal, engine
    from models.database_models import Cluster
    
    session = SessionLocal()
    try:
        clusters = session.query(Cluster).all()
        print(f"   Found {len(clusters)} clusters in database")
        print("   ✓ Database: WORKING")
    finally:
        session.close()
    
except Exception as e:
    print(f"   ✗ Database Failed: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 3: AI Service (Groq with updated httpx)
print("\n3. Testing AI Service (Groq)...")
try:
    from groq import Groq
    from core.config import settings
    
    client = Groq(api_key=settings.groq_api_key)
    
    # Simple test
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say 'Working!' in one word"}],
        max_tokens=10
    )
    
    result = response.choices[0].message.content
    print(f"   AI Response: {result}")
    print("   ✓ AI Service (Groq): WORKING")
    
except Exception as e:
    print(f"   ✗ AI Service Failed: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 4: PDF Processing
print("\n4. Testing PDF Processing Libraries...")
try:
    import PyPDF2
    import pdfplumber
    
    print(f"   PyPDF2 version: {PyPDF2.__version__}")
    print(f"   pdfplumber available: Yes")
    print("   ✓ PDF Processing: WORKING")
    
except Exception as e:
    print(f"   ✗ PDF Processing Failed: {str(e)}")

print("\n" + "=" * 70)
print("QUICK TEST COMPLETE")
print("=" * 70)
print("\nNote: Vector Store & RAG tests skipped (requires model download)")
print("      These will work when the embedding model is downloaded.")
