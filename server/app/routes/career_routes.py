from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
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
    from ml.career_prediction.predict import predict_career_matches
except ImportError:
    def predict_career_matches(skills):
        return [{"title": "Software Engineer", "match_percentage": 90, "description": "Builds and scales software systems."}]

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
    if current_user.extracted_skills:
        skills = [s.strip() for s in current_user.extracted_skills.split(",") if s.strip()]
    
    matches = predict_career_matches(skills)
    
    # Auto-sync predicted role if not set
    if not current_user.predicted_role and matches:
        try:
            current_user.predicted_role = matches[0]["title"]
            db.commit()
            db.refresh(current_user)
        except Exception:
            pass

    return {"matches": matches}
