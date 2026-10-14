import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
SERVER_DIR = os.path.join(ROOT_DIR, "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.models.base import SessionLocal, Base, engine
from app.models.user import User
from app.middleware.auth import get_password_hash

def seed_database():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        demo_email = "demo@careercraft.ai"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            print(f"Seeding demo user: {demo_email}...")
            demo_user = User(
                email=demo_email,
                hashed_password=get_password_hash("password123"),
                extracted_skills="Python,FastAPI,React,Docker,PostgreSQL,TypeScript,Machine Learning",
                predicted_role="Full Stack & AI Engineer"
            )
            db.add(demo_user)
            db.commit()
            print("Demo user successfully seeded!")
        else:
            print("Demo user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
