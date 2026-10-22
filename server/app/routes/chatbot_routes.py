from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.models.user import User
from app.middleware.auth import get_current_user
import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)
try:
    from ml.chatbot.rag_pipeline import generate_chat_response
except ImportError:
    def generate_chat_response(msg, conversation_history=None):
        return "I'm here to help with your career. Ask me about interview prep, resumes, or salary negotiation!"

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatTurn(BaseModel):
    role: str   # 'user' or 'ai'
    text: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatTurn]] = None

class ChatResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatResponse)
def send_chat_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    history = [t.dict() for t in (request.conversation_history or [])]
    reply = generate_chat_response(request.message, conversation_history=history)
    return {"reply": reply}
