from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
try:
    from ml.job_recommender.recommend_jobs import predict_jobs
except ImportError:
    def predict_jobs(skills):
        return []

router = APIRouter(prefix="/jobs", tags=["jobs"])

class JobRecommendation(BaseModel):
    title: str
    company: str
    location: str
    match_score: int
    url: str

class JobResponse(BaseModel):
    jobs: List[JobRecommendation]

@router.get("/recommendations", response_model=JobResponse)
def get_job_recommendations(current_user: User = Depends(get_current_user)):
    skills = []
    if current_user.extracted_skills:
        skills = current_user.extracted_skills.split(",")
        
    jobs = predict_jobs(skills)
    return {"jobs": jobs}
