from fastapi import APIRouter, Depends
from pydantic import BaseModel
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
    def generate_chat_response(msg):
        return "Mock response"

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatResponse)
def send_chat_message(request: ChatRequest, current_user: User = Depends(get_current_user)):
    reply = generate_chat_response(request.message)
    return {"reply": reply}
