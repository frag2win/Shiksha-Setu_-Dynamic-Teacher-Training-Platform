# Backend Scripts

This folder contains utility and maintenance scripts for the Shiksha-Setu backend.

## Structure

### `/database`
Database initialization and setup scripts:
- `init_database.py` - Initialize the main database schema
- `init_auth_users.py` - Set up authentication users
- `init_db_render.py` - Database initialization for Render deployment

### `/migration`
Database migration scripts for schema updates:
- `migrate_database.py` - Main database migration script
- `migrate_hidden_clusters.py` - Add hidden clusters functionality
- `migrate_decision_intelligence.py` - Add decision intelligence features
- `add_hidden_clusters_table.py` - Create hidden clusters table
- `add_pinned_column.py` - Add pinned column to tables

### Root Scripts
- `generate_fake_data.py` - Generate fake data for testing
- `list_users.py` - List all users in the database

## Usage

Run scripts from the backend root directory:
```bash
python scripts/database/init_database.py
python scripts/migration/migrate_database.py
python scripts/generate_fake_data.py
```

**Last Updated:** January 21, 2026
