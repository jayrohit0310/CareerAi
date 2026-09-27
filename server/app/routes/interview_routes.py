from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))
try:
    from ml.scoring.score import score_interview_answer
except ImportError:
    def score_interview_answer(q, a):
        return {"score": 80, "feedback": "Mock feedback"}

router = APIRouter(prefix="/interview", tags=["interview"])

class InterviewStartResponse(BaseModel):
    session_id: str
    first_question: str

class AnswerRequest(BaseModel):
    session_id: str
    answer_text: str

class AnswerResponse(BaseModel):
    score: int
    feedback: str
    next_question: str

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(current_user: User = Depends(get_current_user)):
    return {
        "session_id": "mock_session_123",
        "first_question": "Tell me about a time you faced a difficult challenge at work."
    }

@router.post("/submit-answer", response_model=AnswerResponse)
def submit_answer(request: AnswerRequest, current_user: User = Depends(get_current_user)):
    # Currently assuming a static question for the mock
    question = "Tell me about a time you faced a difficult challenge at work."
    
    evaluation = score_interview_answer(question, request.answer_text)
    
    return {
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "next_question": "What is your greatest weakness?"
    }
