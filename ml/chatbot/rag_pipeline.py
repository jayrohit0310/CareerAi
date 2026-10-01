import os
import json
import ssl
import urllib.request
from typing import List, Dict, Any
from ml.chatbot.vector_store import store

def get_gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key or key == "your_gemini_api_key_here":
        try:
            root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
            if os.path.exists(root_env):
                for line in open(root_env, encoding="utf-8"):
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val and val != "your_gemini_api_key_here":
                            return val
        except Exception:
            pass
    return key

def call_gemini_generate(prompt: str, candidate_models: List[str] = None) -> str:
    """
    Calls Gemini generateContent using a resilient model cascade and HTTPS.
    Avoids Windows SSL/gRPC certificate verification pitfalls.
    """
    api_key = get_gemini_api_key()
    if not api_key or api_key == "your_gemini_api_key_here":
        return ""

    if candidate_models is None:
        candidate_models = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"]

    payload = json.dumps({
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "topP": 0.9,
            "maxOutputTokens": 800
        }
    }).encode("utf-8")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "CareerCraft-AI/1.0"
            }
        )
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
                result = json.loads(response.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()
        except Exception as e:
            # Try next model in the fallback cascade
            continue

    return ""

def generate_chat_response(message: str) -> str:
    """
    High-accuracy RAG (Retrieval-Augmented Generation) pipeline for CareerCraft AI.
    1. Retrieves top relevant domain knowledge documents from the semantic vector store.
    2. Constructs a grounded context prompt for Gemini.
    3. Returns a synthesized, factual, actionable career advisory response.
    """
    if not message or not message.strip():
        return "How can I assist your career development today? Ask about resumes, interviews, salaries, or role transitions."

    # 1. Retrieval Phase
    retrieved_chunks = store.search(message, top_k=3)
    
    context_str = ""
    for idx, item in enumerate(retrieved_chunks):
        score = item.get("score", 0.0)
        doc = item.get("document", "")
        context_str += f"[Source {idx+1} (Relevance: {score:.2f})]: {doc}\n"

    # 2. Augmentation & Prompt Engineering Phase
    prompt = f"""You are CareerCraft AI, an elite Career Strategist, Technical Talent Advisor, and Interview Coach.
You provide precise, actionable, and structured guidance to software engineers and tech professionals.

### VERIFIED CAREER KNOWLEDGE BASE:
{context_str}

### CANDIDATE INQUIRY:
{message}

### INSTRUCTIONS:
- Answer the candidate's inquiry thoroughly and directly.
- Ground your advice in the verified knowledge base provided above whenever relevant.
- Use clear markdown formatting, bullet points, and bold text for readability.
- If recommending interview strategies, refer to the STAR method (Situation, Task, Action, Result).
- If discussing resumes, cite quantifiable metric formulas (X-Y-Z formula) and ATS keywords.
- Keep the response encouraging, professional, and directly actionable without unnecessary preamble.
"""

    # 3. Generation Phase via Gemini
    ai_response = call_gemini_generate(prompt)
    if ai_response:
        return ai_response

    # 4. Fallback Grounded Synthesis (If API is offline or key missing)
    return fallback_grounded_response(message, retrieved_chunks)

def fallback_grounded_response(message: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Generates a coherent response directly from retrieved vector store knowledge
    when external LLM APIs are unreachable.
    """
    if not retrieved_chunks or retrieved_chunks[0].get("score", 0.0) < 0.15:
        return (
            f"Here is some strategic advice regarding your question: '{message}'.\n\n"
            "- **Profile & Skills:** Make sure to keep your core competencies updated on your CareerCraft dashboard.\n"
            "- **Target Roles:** Focus on building 2-3 end-to-end projects demonstrating your top skills.\n"
            "- **Next Step:** You can run a mock interview or check our salary estimator to benchmark your experience level."
        )

    best_match = retrieved_chunks[0].get("document", "")
    additional_insights = [chunk["document"] for chunk in retrieved_chunks[1:3] if chunk.get("score", 0.0) > 0.2]

    response = f"### Career Advisory Insight\n\n{best_match}\n\n"
    if additional_insights:
        response += "**Key Takeaways & Strategy:**\n"
        for insight in additional_insights:
            response += f"- {insight}\n"

    response += "\n*Feel free to ask a follow-up question or test these concepts in our AI Mock Interview simulator!*"
    return response
