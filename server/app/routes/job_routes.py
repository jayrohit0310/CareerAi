import os
import sys
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.models.interview import Resume
from app.middleware.auth import get_current_user

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
    resume_id: Optional[int] = None
    resume_filename: Optional[str] = None

@router.get("/recommendations", response_model=JobResponse)
def get_job_recommendations(
    opportunity_type: str = Query("all", description="Filter by opportunity type: all, job, or internship"),
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
            cached_jobs = parsed.get("scan_results", {}).get("jobs")
            if cached_jobs and len(cached_jobs) > 0:
                filtered_jobs = cached_jobs
                if opportunity_type != "all":
                    filtered_jobs = [j for j in cached_jobs if j.get("opportunity_type") == opportunity_type]
                return {
                    "jobs": filtered_jobs,
                    "resume_id": resume.id,
                    "resume_filename": resume.filename
                }
        except Exception as e:
            print(f"Error reading cached jobs: {e}")

    # 3. Fallback compute using resume skills or user skills
    skills = []
    if resume and resume.extracted_skills:
        skills = [s.strip() for s in resume.extracted_skills.split(",") if s.strip()]
    elif current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    jobs = predict_jobs(skills, opportunity_type=opportunity_type)
    return {
        "jobs": jobs,
        "resume_id": resume.id if resume else None,
        "resume_filename": resume.filename if resume else None
    }
