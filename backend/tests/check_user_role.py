"""Quick script to check the role of a user by email"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.database import SessionLocal
from models.database_models import User

def check_user_role(email: str):
    """Check the role of a user by email"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User found:")
            print(f"  Name: {user.name}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role.value}")
            print(f"  School ID: {user.school_id}")
            print(f"  Active: {user.is_active}")
        else:
            print(f"No user found with email: {email}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_user_role.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    check_user_role(email)
