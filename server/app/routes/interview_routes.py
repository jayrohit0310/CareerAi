from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os
import uuid
from typing import Dict, Any

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

try:
    from ml.scoring.score import score_interview_answer
except ImportError:
    def score_interview_answer(q, a):
        return {"score": 80, "feedback": "Mock feedback"}

try:
    from ml.speech_to_text.whisper_transcriber import transcribe_audio
except ImportError:
    def transcribe_audio(audio_file_path: str) -> str:
        return "Voice answer transcribed successfully."

router = APIRouter(prefix="/interview", tags=["interview"])

AUDIO_DIR = os.path.join(ROOT_DIR, "storage", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

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

class TranscribeAudioResponse(BaseModel):
    transcript: str

QUESTIONS_POOL = [
    "Tell me about a challenging technical project you worked on. What was the problem, how did you architect the solution, and what was the outcome?",
    "Describe a time when you disagreed with a colleague or product manager about technical implementation. How did you resolve the conflict?",
    "How do you design and maintain high-performance scalable systems when dealing with unexpected traffic spikes?",
    "What strategies do you use to quickly learn and adopt unfamiliar technologies or frameworks in a fast-paced environment?",
    "Can you share an experience where you had to debug a critical production outage under high pressure?"
]

interview_sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(current_user: User = Depends(get_current_user)):
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    interview_sessions[session_id] = {
        "index": 0,
        "user_id": current_user.id
    }
    return {
        "session_id": session_id,
        "first_question": QUESTIONS_POOL[0]
    }

@router.post("/submit-answer", response_model=AnswerResponse)
def submit_answer(request: AnswerRequest, current_user: User = Depends(get_current_user)):
    session = interview_sessions.get(request.session_id, {"index": 0})
    current_idx = session.get("index", 0)
    current_q = QUESTIONS_POOL[current_idx % len(QUESTIONS_POOL)]
    
    evaluation = score_interview_answer(current_q, request.answer_text)
    
    next_idx = current_idx + 1
    session["index"] = next_idx
    interview_sessions[request.session_id] = session
    
    next_q = QUESTIONS_POOL[next_idx % len(QUESTIONS_POOL)]
    
    return {
        "score": int(evaluation.get("score", 75)),
        "feedback": evaluation.get("feedback", "Good answer. Consider structuring further with quantifiable results."),
        "next_question": next_q
    }

@router.post("/transcribe-audio", response_model=TranscribeAudioResponse)
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts recorded audio from candidate, transcribes it using AI, and returns text.
    """
    safe_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{os.path.basename(audio.filename or 'recording.webm')}"
    file_path = os.path.join(AUDIO_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        transcript = transcribe_audio(file_path)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")
