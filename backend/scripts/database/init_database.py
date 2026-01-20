"""
Database initialization script
Creates all tables and sets up the database
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from core.database import engine, Base, init_db
from models.database_models import Cluster, Manual, Module

print("Initializing Shiksha Setu Database")
print("=" * 50)
print()

try:
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✓ Tables created successfully:")
    print("  - clusters")
    print("  - manuals")
    print("  - modules")
    print()
    
    # Verify tables exist
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"✓ Verified {len(tables)} tables in database:")
    for table in tables:
        columns = inspector.get_columns(table)
        print(f"  - {table} ({len(columns)} columns)")
    
    print()
    print("✓ Database initialization complete!")
    print(f"Database file: shiksha_setu.db")
    
except Exception as e:
    print(f"✗ Error initializing database: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
