from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import User
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    subject: str
    message: str

class FeedbackResponse(BaseModel):
    status: str
    message: str

@router.post("/", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest, current_user: User = Depends(get_current_user)):
    # In a real app, save to database
    return {
        "status": "success",
        "message": "Feedback submitted successfully. Thank you!"
    }
