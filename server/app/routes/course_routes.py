import os
import sys
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.models.interview import Resume
from app.middleware.auth import get_current_user

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

try:
    from ml.course_recommender.recommend_courses import predict_courses
except ImportError:
    def predict_courses(skills):
        return []

router = APIRouter(prefix="/course", tags=["course"])

class CourseRecommendation(BaseModel):
    title: str
    platform: str
    url: str
    reason: str
    category: Optional[str] = "fullstack"
    level: Optional[str] = "Intermediate"
    duration: Optional[str] = "20 hours"
    rating: Optional[float] = 4.7
    students: Optional[str] = "50,000+"
    skill_tags: Optional[List[str]] = Field(default_factory=list)

class CourseResponse(BaseModel):
    courses: List[CourseRecommendation]
    resume_id: Optional[int] = None
    resume_filename: Optional[str] = None

@router.get("/recommendations", response_model=CourseResponse)
def get_course_recommendations(
    resume_id: Optional[int] = Query(None, description="Optional specific resume ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Resolve resume (specified or primary)
    resume = None
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == True).order_by(Resume.created_at.desc()).first()

    # 2. Check if cached scan results exist
    if resume and resume.parsed_data:
        try:
            parsed = json.loads(resume.parsed_data)
            cached_courses = parsed.get("scan_results", {}).get("courses")
            if cached_courses and len(cached_courses) > 0:
                for c in cached_courses:
                    if "skills" in c and "skill_tags" not in c:
                        c["skill_tags"] = c.pop("skills", [])
                    elif "skill_tags" not in c:
                        c["skill_tags"] = []
                return {
                    "courses": cached_courses,
                    "resume_id": resume.id,
                    "resume_filename": resume.filename
                }
        except Exception as e:
            print(f"Error reading cached courses: {e}")

    # 3. Fallback compute using resume skills or user skills
    skills = []
    if resume and resume.extracted_skills:
        skills = [s.strip() for s in resume.extracted_skills.split(",") if s.strip()]
    elif current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    courses = predict_courses(skills)

    for c in courses:
        if "skills" in c and "skill_tags" not in c:
            c["skill_tags"] = c.pop("skills", [])
        elif "skill_tags" not in c:
            c["skill_tags"] = []

    return {
        "courses": courses,
        "resume_id": resume.id if resume else None,
        "resume_filename": resume.filename if resume else None
    }
