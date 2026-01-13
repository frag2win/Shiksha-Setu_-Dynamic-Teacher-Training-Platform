"""
Test script for database and vector store setup
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print("Testing Shiksha Setu Database & Vector Store")
print("=" * 60)
print()

# Test 1: Database Connection
print("Test 1: Database Connection")
print("-" * 60)
try:
    from core.database import engine, SessionLocal
    from sqlalchemy import inspect
    
    # Get table info
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"✓ Connected to database")
    print(f"✓ Found {len(tables)} tables: {', '.join(tables)}")
    
    # Test session
    db = SessionLocal()
    print(f"✓ Database session created")
    db.close()
    print()
    
except Exception as e:
    print(f"✗ Database test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Vector Store
print("Test 2: Vector Store (Simple)")
print("-" * 60)
try:
    from core.vector_store import SimpleVectorStore
    
    # Create test vector store
    vs = SimpleVectorStore(persist_directory="./test_vector_store")
    print(f"✓ Vector store initialized")
    print(f"  Model: all-MiniLM-L6-v2")
    print(f"  Documents: {vs.get_collection_size()}")
    
    # Add test documents
    test_docs = [
        "Teaching methods for primary education",
        "Classroom management techniques",
        "Student assessment strategies"
    ]
    test_metadata = [
        {"manual_id": "1", "type": "pedagogy"},
        {"manual_id": "1", "type": "management"},
        {"manual_id": "1", "type": "assessment"}
    ]
    test_ids = ["test_1", "test_2", "test_3"]
    
    vs.add_documents(test_docs, test_metadata, test_ids)
    print(f"✓ Added 3 test documents")
    print(f"  Total documents: {vs.get_collection_size()}")
    
    # Test search
    results = vs.search("classroom teaching", n_results=2)
    print(f"✓ Search working - found {len(results['documents'][0])} results")
    
    # Cleanup
    import shutil
    shutil.rmtree("./test_vector_store")
    print(f"✓ Cleaned up test data")
    print()
    
except Exception as e:
    print(f"✗ Vector store test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: RAG Engine
print("Test 3: RAG Engine Integration")
print("-" * 60)
try:
    from services.rag_engine import RAGEngine
    
    rag = RAGEngine()
    print(f"✓ RAG Engine initialized")
    
    stats = rag.get_stats()
    print(f"✓ RAG stats: {stats}")
    print()
    
except Exception as e:
    print(f"✗ RAG Engine test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Models Import
print("Test 4: Database Models")
print("-" * 60)
try:
    from models.database_models import Cluster, Manual, Module, Feedback
    
    print("✓ Cluster model imported")
    print("✓ Manual model imported")
    print("✓ Module model imported")
    print("✓ Feedback model imported")
    print()
    
except Exception as e:
    print(f"✗ Models import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Create sample data
print("Test 5: Create Sample Cluster")
print("-" * 60)
try:
    from models.database_models import Cluster
    from core.database import SessionLocal
    
    db = SessionLocal()
    
    # Check if sample cluster exists
    existing = db.query(Cluster).filter(Cluster.name == "Test Cluster").first()
    if existing:
        print(f"✓ Sample cluster already exists (ID: {existing.id})")
    else:
        # Create sample cluster
        cluster = Cluster(
            name="Test Cluster",
            state="Maharashtra",
            district="Pune",
            focus_areas=["Primary Education", "Teacher Training"],
            teacher_count=50,
            school_count=10
        )
        db.add(cluster)
        db.commit()
        print(f"✓ Created sample cluster (ID: {cluster.id})")
    
    # Count total clusters
    total = db.query(Cluster).count()
    print(f"✓ Total clusters in database: {total}")
    
    db.close()
    print()
    
except Exception as e:
    print(f"✗ Sample data creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Summary
print("=" * 60)
print("✓ ALL TESTS PASSED!")
print()
print("Summary:")
print("  - SQLite database: Ready")
print("  - Vector store: Ready (SimpleVectorStore with sentence-transformers)")
print("  - RAG Engine: Ready")
print("  - Database models: Ready")
print("  - Sample data: Created")
print()
print("Next Steps:")
print("  1. Start the backend: uvicorn main:app --reload")
print("  2. Test API endpoints at http://localhost:8000/docs")
print("  3. Upload training manuals (PDFs)")
print("  4. Generate training modules")
