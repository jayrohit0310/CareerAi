from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
try:
    from ml.salary_prediction.predict_salary import predict_salary_range
except ImportError:
    def predict_salary_range(role, exp):
        return {"min_salary": 80000, "max_salary": 120000, "median_salary": 100000, "currency": "USD", "role": role}

router = APIRouter(prefix="/salary", tags=["salary"])

class SalaryEstimateResponse(BaseModel):
    min_salary: int
    max_salary: int
    median_salary: int
    currency: str
    role: str

@router.get("/estimate", response_model=SalaryEstimateResponse)
def get_salary_estimate(current_user: User = Depends(get_current_user)):
    # Determine role (mock logic, ideally from user profile)
    role = "Software Engineer"
    # Call the ML module
    estimate = predict_salary_range(role, experience_years=3)
    return estimate
