import os
import sys
import json
from typing import Optional
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
    from ml.salary_prediction.predict_salary import predict_salary_range
except ImportError:
    def predict_salary_range(role, experience_years=3):
        return {"min_salary": 1200000, "max_salary": 2400000, "median_salary": 1800000, "currency": "INR", "role": role}

router = APIRouter(prefix="/salary", tags=["salary"])

class SalaryEstimateResponse(BaseModel):
    min_salary: int
    max_salary: int
    median_salary: int
    currency: str
    role: str
    resume_id: Optional[int] = None
    resume_filename: Optional[str] = None

@router.get("/estimate", response_model=SalaryEstimateResponse)
def get_salary_estimate(
    role: Optional[str] = Query(None, description="Target role name"),
    experience_years: Optional[int] = Query(None, ge=0, le=30, description="Years of relevant experience"),
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

    # 2. Check if cached scan results exist and no specific override requested
    if not role and not experience_years and resume and resume.parsed_data:
        try:
            parsed = json.loads(resume.parsed_data)
            cached_salary = parsed.get("scan_results", {}).get("salary_estimate")
            if cached_salary:
                cached_salary["resume_id"] = resume.id
                cached_salary["resume_filename"] = resume.filename
                return cached_salary
        except Exception as e:
            print(f"Error reading cached salary: {e}")

    # 3. Fallback compute
    exp = experience_years
    if exp is None and resume and resume.parsed_data:
        try:
            parsed = json.loads(resume.parsed_data)
            exp = parsed.get("scan_results", {}).get("experience_years")
        except Exception:
            exp = None

    if exp is None:
        exp = 3

    selected_role = role
    if not selected_role and resume and resume.parsed_data:
        try:
            parsed = json.loads(resume.parsed_data)
            selected_role = parsed.get("scan_results", {}).get("target_role")
        except Exception:
            selected_role = None

    if not selected_role:
        selected_role = current_user.predicted_role or "Software Engineer"

    estimate = predict_salary_range(selected_role, experience_years=exp)
    estimate["resume_id"] = resume.id if resume else None
    estimate["resume_filename"] = resume.filename if resume else None
    return estimate
