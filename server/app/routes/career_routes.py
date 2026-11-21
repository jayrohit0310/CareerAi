import os
import sys
import json
from typing import List, Optional, Any, Dict
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
    from ml.career_prediction.predict import predict_career_matches, generate_career_pathway_report
except ImportError:
    def predict_career_matches(skills, resume_data=None):
        return [{"title": "Software Engineer", "match_percentage": 90, "description": "Builds and scales software systems."}]
    def generate_career_pathway_report(skills=None, resume_data=None, candidate_name="Candidate", resume_filename=None):
        return {
            "matches": predict_career_matches(skills or []),
            "readiness_score": 80,
            "executive_summary": "",
            "top_strengths": [],
            "action_plan_30_60_90": {},
            "target_median_salary": "₹20,00,000 (20 LPA)",
            "candidate_name": candidate_name
        }

router = APIRouter(prefix="/career", tags=["career"])

class CareerMatch(BaseModel):
    title: str
    match_percentage: int
    description: str

class CareerMatchesResponse(BaseModel):
    matches: List[CareerMatch]
    resume_id: Optional[int] = None
    resume_filename: Optional[str] = None

@router.get("/matches", response_model=CareerMatchesResponse)
def get_career_matches(
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
            cached_matches = parsed.get("scan_results", {}).get("career_matches")
            if cached_matches and len(cached_matches) > 0:
                return {
                    "matches": cached_matches,
                    "resume_id": resume.id,
                    "resume_filename": resume.filename
                }
        except Exception as e:
            print(f"Error reading cached career matches: {e}")

    # 3. Fallback compute
    skills = []
    resume_data = {}
    if resume:
        if resume.extracted_skills:
            skills = [s.strip() for s in resume.extracted_skills.split(",") if s.strip()]
        if resume.parsed_data:
            try:
                resume_data = json.loads(resume.parsed_data)
            except Exception:
                pass
    elif current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    matches = predict_career_matches(skills=skills, resume_data=resume_data)

    # Auto-sync predicted role if not set
    if not current_user.predicted_role and matches:
        try:
            current_user.predicted_role = matches[0]["title"]
            db.commit()
            db.refresh(current_user)
        except Exception:
            pass

    return {
        "matches": matches,
        "resume_id": resume.id if resume else None,
        "resume_filename": resume.filename if resume else None
    }


@router.get("/report")
def get_career_report(
    resume_id: Optional[int] = Query(None, description="Optional specific resume ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the full Career Pathway & Skill Synergy dossier report
    generated from the candidate's active or specified uploaded resume profile.
    """
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
            cached_report = parsed.get("scan_results", {}).get("career_report")
            if cached_report:
                cached_report["resume_id"] = resume.id
                cached_report["resume_filename"] = resume.filename
                return cached_report
        except Exception as e:
            print(f"Error reading cached career report: {e}")

    # 3. Fallback compute
    skills = []
    resume_data = {}
    resume_filename = None

    if resume:
        resume_filename = resume.filename
        if resume.extracted_skills:
            skills = [s.strip() for s in resume.extracted_skills.split(",") if s.strip()]
        if resume.parsed_data:
            try:
                resume_data = json.loads(resume.parsed_data)
            except Exception:
                pass
    elif current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]

    candidate_name = resume_data.get("candidate_name") or current_user.email.split("@")[0]

    report = generate_career_pathway_report(
        skills=skills,
        resume_data=resume_data,
        candidate_name=candidate_name,
        resume_filename=resume_filename
    )

    report["resume_id"] = resume.id if resume else None
    report["resume_filename"] = resume.filename if resume else None

    # Auto-sync predicted role
    if not current_user.predicted_role and report.get("matches"):
        try:
            current_user.predicted_role = report["matches"][0]["title"]
            db.commit()
            db.refresh(current_user)
        except Exception:
            pass

    return report
