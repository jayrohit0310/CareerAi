from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)
try:
    from ml.salary_prediction.predict_salary import predict_salary_range
except ImportError:
    def predict_salary_range(role, exp):
        return {"min_salary": 1200000, "max_salary": 2400000, "median_salary": 1800000, "currency": "INR", "role": role}

router = APIRouter(prefix="/salary", tags=["salary"])

class SalaryEstimateResponse(BaseModel):
    min_salary: int
    max_salary: int
    median_salary: int
    currency: str
    role: str

@router.get("/estimate", response_model=SalaryEstimateResponse)
def get_salary_estimate(
    role: Optional[str] = Query(None, description="Target role name"),
    experience_years: int = Query(3, ge=0, le=30, description="Years of relevant experience"),
    current_user: User = Depends(get_current_user)
):
    selected_role = role or current_user.predicted_role or "Software Engineer"
    estimate = predict_salary_range(selected_role, experience_years=experience_years)
    return estimate

