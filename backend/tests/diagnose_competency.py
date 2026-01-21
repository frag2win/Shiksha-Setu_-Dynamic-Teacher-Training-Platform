"""
Diagnostic script to check user permissions and database state
Run this to troubleshoot competency dashboard issues
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.database import SessionLocal
from models.database_models import User, UserRole, TeacherCompetency
from sqlalchemy import func

def diagnose_issue():
    """Run comprehensive diagnostics"""
    db = SessionLocal()
    
    print("\n" + "="*60)
    print("COMPETENCY DASHBOARD DIAGNOSTIC REPORT")
    print("="*60 + "\n")
    
    try:
        # 1. Check all users and their roles
        print("1. USER ROLES IN DATABASE:")
        print("-" * 60)
        users = db.query(User).all()
        for user in users:
            print(f"   Email: {user.email}")
            print(f"   Name: {user.name}")
            print(f"   Role: {user.role.value}")
            print(f"   Active: {user.is_active}")
            print(f"   School ID: {user.school_id}")
            print()
        
        # 2. Check role distribution
        print("\n2. ROLE DISTRIBUTION:")
        print("-" * 60)
        role_counts = db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        for role, count in role_counts:
            print(f"   {role.value.upper()}: {count} user(s)")
        
        # 3. Check if competency table exists and has data
        print("\n3. COMPETENCY DATA:")
        print("-" * 60)
        competency_count = db.query(TeacherCompetency).count()
        print(f"   Total competency records: {competency_count}")
        
        if competency_count > 0:
            # Show sample records
            sample = db.query(TeacherCompetency).limit(3).all()
            for comp in sample:
                user = db.query(User).filter(User.id == comp.user_id).first()
                print(f"   - User: {user.email if user else 'Unknown'}")
                print(f"     Area: {comp.competency_area}")
                print(f"     Level: {comp.level}")
                print(f"     Modules: {comp.modules_completed}")
        
        # 4. Check which users have competency records
        print("\n4. USERS WITH COMPETENCY RECORDS:")
        print("-" * 60)
        users_with_comp = db.query(User).join(
            TeacherCompetency,
            User.id == TeacherCompetency.user_id
        ).distinct().all()
        
        if users_with_comp:
            for user in users_with_comp:
                count = db.query(TeacherCompetency).filter(
                    TeacherCompetency.user_id == user.id
                ).count()
                print(f"   {user.email} ({user.role.value}): {count} competency records")
        else:
            print("   No users have competency records yet")
        
        # 5. Recommendations
        print("\n5. DIAGNOSTIC RECOMMENDATIONS:")
        print("-" * 60)
        
        admin_users = [u for u in users if u.role == UserRole.ADMIN]
        principal_users = [u for u in users if u.role == UserRole.PRINCIPAL]
        teacher_users = [u for u in users if u.role == UserRole.TEACHER]
        
        if not admin_users and not principal_users and not teacher_users:
            print("   ❌ NO USERS with TEACHER, PRINCIPAL, or ADMIN roles found!")
            print("   → Create a user with one of these roles")
        
        if competency_count == 0:
            print("   ⚠️  No competency records exist yet")
            print("   → This is normal for first-time access")
            print("   → Records will be created automatically on first dashboard visit")
        
        # Check for VISITOR role users
        visitor_users = [u for u in users if u.role == UserRole.VISITOR]
        if visitor_users:
            print(f"   ⚠️  {len(visitor_users)} VISITOR role user(s) found")
            print("   → VISITOR role cannot access competency dashboard")
            print("   → Change role to TEACHER, PRINCIPAL, or ADMIN")
        
        print("\n" + "="*60)
        print("DIAGNOSIS COMPLETE")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR during diagnosis: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_issue()
