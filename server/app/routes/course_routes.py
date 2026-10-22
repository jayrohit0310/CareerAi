from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

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

@router.get("/recommendations", response_model=CourseResponse)
def get_course_recommendations(current_user: User = Depends(get_current_user)):
    skills = []
    if current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    courses = predict_courses(skills)

    # Normalise: ensure skill_tags is always a list
    for c in courses:
        if "skills" in c and "skill_tags" not in c:
            c["skill_tags"] = c.pop("skills", [])
        elif "skill_tags" not in c:
            c["skill_tags"] = []

    return {"courses": courses}
