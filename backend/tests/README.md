# Backend Tests

This folder contains all test files for the Shiksha-Setu backend.

## Test Categories

### Database Tests
- `check_db.py` - Database connectivity check
- `check_db_data.py` - Verify database data integrity
- `test_model.py` - Test database models
- `test_soft_delete.py` - Test soft delete functionality

### Authentication Tests
- `test_all_roles.py` - Test role-based access control
- `test_bcrypt.py` - Test password hashing
- `test_login.py` - Test login functionality
- `test_hf_auth.py` - Test HuggingFace authentication

### API Tests
- `test_api_endpoints.py` - Test API endpoints
- `test_api_simple.py` - Simple API tests
- `test_final_integration.py` - Full integration tests
- `test_cluster_create.py` - Test cluster creation

### Translation Tests
- `test_translation.py` - Main translation tests
- `test_translation_fixed.py` - Fixed translation tests
- `test_translation_simple.py` - Simple translation tests
- `test_translation_working.py` - Working translation tests
- `test_quick_translation.py` - Quick translation checks
- `test_google_translate.py` - Google Translate API tests

### Vector Store Tests
- `check_chroma.py` - ChromaDB connectivity check
- `test_chromadb.py` - ChromaDB functionality tests

### Other Tests
- `test_setup.py` - Test environment setup
- `test_quick.py` - Quick sanity tests
- `test_groq.py` - Groq API tests

## Running Tests

Run tests from the backend root directory:
```bash
# Run all tests
pytest tests/

# Run specific test
python tests/test_api_endpoints.py

# Run test category
pytest tests/test_translation*.py
```

**Last Updated:** January 21, 2026
