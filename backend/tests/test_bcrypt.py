"""Debug bcrypt password hashing"""
import bcrypt

# Test password
password = "admin123"
password_bytes = password.encode('utf-8')[:72]

# Hash it
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password_bytes, salt)
hashed_str = hashed.decode('utf-8')

print(f"Original password: {password}")
print(f"Password bytes: {password_bytes}")
print(f"Hashed password: {hashed_str}")
print(f"Hash length: {len(hashed_str)}")

# Try to verify
verification1 = bcrypt.checkpw(password_bytes, hashed)
print(f"\nVerification with bytes: {verification1}")

# Try with encoded hash
verification2 = bcrypt.checkpw(password_bytes, hashed_str.encode('utf-8'))
print(f"Verification with re-encoded: {verification2}")

# Get actual hash from database
import sys
sys.path.insert(0, 'backend')
from core.database import SessionLocal
from models.database_models import User

db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@shiksha-setu.gov.in').first()
if user:
    print(f"\nDatabase hash: {user.password_hash}")
    print(f"DB Hash length: {len(user.password_hash)}")
    
    # Try verification with DB hash
    verification3 = bcrypt.checkpw(password_bytes, user.password_hash.encode('utf-8'))
    print(f"Verification with DB hash: {verification3}")
db.close()
