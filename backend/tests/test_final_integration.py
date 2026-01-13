"""
Final Integration Test for All Services
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

print("=" * 70)
print("FINAL INTEGRATION TEST")
print("=" * 70)

# Test 1: Translation Service
print("\n1. Testing Translation Service...")
try:
    from services.translation_service import get_translation_service
    
    ts = get_translation_service()
    
    # Test Hindi
    result = ts.translate("Welcome to Teacher Training Platform", "hindi")
    print(f"   English → Hindi: {result}")
    
    # Test Marathi
    result = ts.translate("Module 1: Introduction", "marathi")
    print(f"   English → Marathi: {result}")
    
    # Test batch
    texts = ["Hello", "Teacher", "Student"]
    results = ts.batch_translate(texts, "hindi")
    print(f"   Batch translation: {results}")
    
    print("   ✓ Translation Service: WORKING")
    
except Exception as e:
    print(f"   ✗ Translation Service Failed: {str(e)}")

# Test 2: Database
print("\n2. Testing Database...")
try:
    from core.database import SessionLocal, engine
    from models.cluster import Cluster
    
    session = SessionLocal()
    try:
        clusters = session.query(Cluster).all()
        print(f"   Found {len(clusters)} clusters in database")
    finally:
        session.close()
    
    print("   ✓ Database: WORKING")
    
except Exception as e:
    print(f"   ✗ Database Failed: {str(e)}")

# Test 3: Vector Store
print("\n3. Testing Vector Store...")
try:
    from core.vector_store import SimpleVectorStore
    
    vs = SimpleVectorStore(persist_directory="./test_vector_store")
    
    # Add test documents
    docs = [
        "This is a teacher training manual",
        "Module about classroom management",
        "Assessment and evaluation techniques"
    ]
    metadatas = [
        {"source": "test1", "manual_id": "1"},
        {"source": "test2", "manual_id": "1"},
        {"source": "test3", "manual_id": "1"}
    ]
    
    vs.add_documents("test_collection", docs, metadatas)
    
    # Search
    results = vs.search(collection_name="test_collection", query="teaching methods", n_results=2)
    print(f"   Search returned {len(results['documents'][0])} results")
    
    print("   ✓ Vector Store: WORKING")
    
except Exception as e:
    print(f"   ✗ Vector Store Failed: {str(e)}")

# Test 4: RAG Engine
print("\n4. Testing RAG Engine...")
try:
    from services.rag_engine import RAGEngine
    
    rag = RAGEngine()
    
    # Test search (should work even with no data)
    results = rag.search("teacher training", top_k=3)
    print(f"   RAG search executed successfully, returned {len(results)} results")
    
    print("   ✓ RAG Engine: WORKING")
    
except Exception as e:
    print(f"   ✗ RAG Engine Failed: {str(e)}")

# Test 5: AI Service
print("\n5. Testing AI Service (Groq)...")
try:
    from services.ai_service import get_ai_service
    
    ai = get_ai_service()
    response = ai.generate_response(
        "What is 2+2?",
        context="Simple math question"
    )
    print(f"   AI Response: {response[:100]}...")
    
    print("   ✓ AI Service: WORKING")
    
except Exception as e:
    print(f"   ✗ AI Service Failed: {str(e)}")

print("\n" + "=" * 70)
print("INTEGRATION TEST COMPLETE")
print("=" * 70)
