import os
import json
import ssl
import urllib.request
from typing import List, Optional

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

def call_gemini_api(
    prompt: str,
    models: Optional[List[str]] = None,
    temperature: float = 0.3,
    max_tokens: int = 1000
) -> str:
    """
    Calls Gemini generateContent with fallback models ('gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-flash-latest').
    Uses HTTPS to guarantee cross-platform SSL stability on Windows.
    """
    api_key = get_gemini_api_key()
    if not api_key or api_key == "your_gemini_api_key_here":
        return ""

    if models is None:
        models = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"]

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
    }).encode("utf-8")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for model_name in models:
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
        except Exception:
            continue

    return ""

def clean_json_response(raw_text: str) -> str:
    """Extracts raw JSON string by stripping code fences."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()
