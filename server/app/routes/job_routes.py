from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)
try:
    from ml.job_recommender.recommend_jobs import predict_jobs
except ImportError:
    def predict_jobs(skills, opportunity_type="all"):
        return []

router = APIRouter(prefix="/jobs", tags=["jobs"])

class JobRecommendation(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    location: str
    opportunity_type: str = "job"
    salary: Optional[str] = None
    match_score: int
    posted: Optional[str] = "Recently"
    skills: List[str] = []
    url: str
    platform: Optional[str] = "LinkedIn"
    description: Optional[str] = None

class JobResponse(BaseModel):
    jobs: List[JobRecommendation]

@router.get("/recommendations", response_model=JobResponse)
def get_job_recommendations(
    opportunity_type: str = Query("all", description="Filter by opportunity type: all, job, or internship"),
    current_user: User = Depends(get_current_user)
):
    skills = []
    if current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]
        
    jobs = predict_jobs(skills, opportunity_type=opportunity_type)
    return {"jobs": jobs}
