import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)
try:
    from ml.career_prediction.predict import predict_career_matches, generate_career_pathway_report
except ImportError:
    def predict_career_matches(skills, resume_data=None):
        return [{"title": "Software Engineer", "match_percentage": 90, "description": "Builds and scales software systems."}]
    def generate_career_pathway_report(skills=None, resume_data=None, candidate_name="Candidate", resume_filename=None):
        return {"matches": predict_career_matches(skills or []), "readiness_score": 80, "executive_summary": "", "top_strengths": [], "action_plan_30_60_90": {}, "target_median_salary": "₹20,00,000 (20 LPA)", "candidate_name": candidate_name}

router = APIRouter(prefix="/career", tags=["career"])

class CareerMatch(BaseModel):
    title: str
    match_percentage: int
    description: str

class CareerMatchesResponse(BaseModel):
    matches: List[CareerMatch]

@router.get("/matches", response_model=CareerMatchesResponse)
def get_career_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills = []
    resume_data = {}
    if current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    # Try to load primary resume parsed_data
    try:
        from app.models.interview import Resume
        primary_resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id, Resume.is_primary == True)
            .order_by(Resume.created_at.desc())
            .first()
        )
        if primary_resume and primary_resume.parsed_data:
            resume_data = json.loads(primary_resume.parsed_data)
    except Exception:
        pass

    matches = predict_career_matches(skills=skills, resume_data=resume_data)
    
    # Auto-sync predicted role if not set
    if not current_user.predicted_role and matches:
        try:
            current_user.predicted_role = matches[0]["title"]
            db.commit()
            db.refresh(current_user)
        except Exception:
            pass

    return {"matches": matches}


@router.get("/report")
def get_career_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the full Career Pathway & Skill Synergy dossier report
    generated from the candidate's uploaded resume profile.
    """
    skills = []
    resume_data = {}
    resume_filename = None

    if current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    # Load primary resume parsed_data
    try:
        from app.models.interview import Resume
        primary_resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id, Resume.is_primary == True)
            .order_by(Resume.created_at.desc())
            .first()
        )
        if primary_resume:
            resume_filename = primary_resume.filename
            if primary_resume.parsed_data:
                resume_data = json.loads(primary_resume.parsed_data)
    except Exception:
        pass

    candidate_name = resume_data.get("candidate_name") or current_user.email.split("@")[0]

    report = generate_career_pathway_report(
        skills=skills,
        resume_data=resume_data,
        candidate_name=candidate_name,
        resume_filename=resume_filename
    )

    # Auto-sync predicted role
    if not current_user.predicted_role and report.get("matches"):
        try:
            current_user.predicted_role = report["matches"][0]["title"]
            db.commit()
        except Exception:
            pass

    return report
