"""
Database Migration Script: Add Decision Intelligence Features
- Add tags column to feedback table
- Create training_recommendations table

Run this script after updating the models to migrate existing database
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    # Find database file
    backend_dir = Path(__file__).parent
    db_paths = [
        backend_dir / "shiksha_setu.db",
        backend_dir.parent / "shiksha_setu.db"
    ]
    
    db_path = None
    for path in db_paths:
        if path.exists():
            db_path = path
            break
    
    if not db_path:
        print("❌ Database file not found. Please run init_database.py first.")
        return False
    
    print(f"📂 Found database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if migrations are needed
        print("\n🔍 Checking existing schema...")
        
        # Check feedback table
        cursor.execute("PRAGMA table_info(feedback)")
        feedback_columns = [row[1] for row in cursor.fetchall()]
        
        migrations_applied = []
        
        # Migration 1: Add tags column to feedback
        if 'tags' not in feedback_columns:
            print("\n📝 Adding 'tags' column to feedback table...")
            cursor.execute("ALTER TABLE feedback ADD COLUMN tags TEXT")
            migrations_applied.append("Added tags column to feedback")
            print("✅ Tags column added")
        else:
            print("✓ Tags column already exists")
        
        # Migration 2: Create training_recommendations table
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='training_recommendations'
        """)
        
        if not cursor.fetchone():
            print("\n📝 Creating training_recommendations table...")
            cursor.execute("""
                CREATE TABLE training_recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cluster_id INTEGER NOT NULL,
                    recommendation_type VARCHAR(100) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    rationale TEXT NOT NULL,
                    priority VARCHAR(20) NOT NULL,
                    priority_score INTEGER NOT NULL,
                    detected_issues TEXT,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at DATETIME,
                    reviewed_by INTEGER,
                    FOREIGN KEY (cluster_id) REFERENCES clusters(id),
                    FOREIGN KEY (reviewed_by) REFERENCES users(id)
                )
            """)
            migrations_applied.append("Created training_recommendations table")
            print("✅ Training recommendations table created")
        else:
            print("✓ Training recommendations table already exists")
        
        # Commit changes
        conn.commit()
        
        # Display summary
        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE")
        print("="*60)
        
        if migrations_applied:
            print("\nMigrations applied:")
            for migration in migrations_applied:
                print(f"  • {migration}")
        else:
            print("\nNo migrations needed - database is up to date")
        
        # Display table info
        print("\n📊 Updated Schema:")
        
        print("\n📋 Feedback table columns:")
        cursor.execute("PRAGMA table_info(feedback)")
        for row in cursor.fetchall():
            print(f"  • {row[1]} ({row[2]})")
        
        print("\n📋 Training Recommendations table columns:")
        cursor.execute("PRAGMA table_info(training_recommendations)")
        for row in cursor.fetchall():
            print(f"  • {row[1]} ({row[2]})")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("="*60)
    print("Database Migration: Decision Intelligence Features")
    print("="*60)
    
    success = migrate_database()
    
    if success:
        print("\n✅ Migration successful!")
        print("You can now use the Decision Intelligence API endpoints.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
