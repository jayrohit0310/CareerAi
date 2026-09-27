from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
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

class CourseResponse(BaseModel):
    courses: List[CourseRecommendation]

@router.get("/recommendations", response_model=CourseResponse)
def get_course_recommendations(current_user: User = Depends(get_current_user)):
    skills = []
    if current_user.extracted_skills:
        skills = current_user.extracted_skills.split(",")
        
    courses = predict_courses(skills)
    return {"courses": courses}
