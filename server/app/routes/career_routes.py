from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

# Add project root to path to import ml
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
try:
    from ml.career_prediction.predict import predict_career_matches
except ImportError:
    # Fallback if path resolution fails
    def predict_career_matches(skills):
        return [{"title": "Software Engineer", "match_percentage": 90, "description": "Mock"}]

router = APIRouter(prefix="/career", tags=["career"])

class CareerMatch(BaseModel):
    title: str
    match_percentage: int
    description: str

class CareerMatchesResponse(BaseModel):
    matches: List[CareerMatch]

@router.get("/matches", response_model=CareerMatchesResponse)
def get_career_matches(current_user: User = Depends(get_current_user)):
    # Using the simulated ML module
    skills = []
    if current_user.extracted_skills:
        skills = current_user.extracted_skills.split(",")
    
    matches = predict_career_matches(skills)
    return {"matches": matches}
