"""Test login functionality"""
import sys
sys.path.insert(0, '.')

from api.auth import verify_password
from core.database import SessionLocal
from models.database_models import User

db = SessionLocal()

# Test admin login
user = db.query(User).filter(User.email == 'admin@shiksha-setu.gov.in').first()

if user:
    print(f"User found: {user.name}")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Is active: {user.is_active}")
    print(f"Password hash (first 50 chars): {user.password_hash[:50]}...")
    
    # Test password verification
    test_password = 'admin123'
    result = verify_password(test_password, user.password_hash)
    print(f"\nPassword verification for '{test_password}': {result}")
else:
    print("User not found!")

db.close()
