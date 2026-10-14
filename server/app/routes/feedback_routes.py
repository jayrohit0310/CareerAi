from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.models.user import User
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    subject: str = Field(..., min_length=2, max_length=200, description="Feedback subject")
    message: str = Field(..., min_length=5, max_length=2000, description="Feedback detailed message")

class FeedbackResponse(BaseModel):
    status: str
    message: str

@router.post("", response_model=FeedbackResponse)
@router.post("/", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest, current_user: User = Depends(get_current_user)):
    if not request.subject.strip() or not request.message.strip():
        raise HTTPException(status_code=400, detail="Subject and message cannot be blank")
    
    return {
        "status": "success",
        "message": f"Thank you {current_user.email}, your feedback has been received and logged."
    }
