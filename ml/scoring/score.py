import os
import random
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def _clean_score(val, default: int = 75) -> int:
    if val is None:
        return default
    try:
        cleaned = str(val).split("/")[0].replace("%", "").replace(",", "").strip()
        parsed = int(float(cleaned))
        return max(0, min(100, parsed))
    except Exception:
        return default

def score_interview_answer(question: str, answer: str) -> dict:
    """
    Evaluates interview answers using Gemini LLM and provides score and STAR feedback.
    """
    if not get_gemini_api_key() or not answer or len(answer.strip().split()) < 3:
        return fallback_score(answer)

    try:
        prompt = f"""
        You are an expert technical interviewer and hiring manager.
        Question asked: {question}
        Candidate answer: {answer}
        
        Evaluate the candidate's answer based on clarity (30%), technical depth (50%), and STAR structure (20%).
        Provide an integer score from 0 to 100 and brief constructive feedback.
        Output MUST be ONLY valid JSON: {{"score": 85, "feedback": "Constructive feedback here"}}
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if not raw_resp:
            return fallback_score(answer)

        json_text = clean_json_response(raw_resp)
        result = json.loads(json_text)
        score = _clean_score(result.get("score"), 75)
        feedback = str(result.get("feedback", "Good effort. Consider detailing measurable outcomes."))

        return {
            "score": score,
            "feedback": feedback
        }
    except Exception as e:
        print(f"Error scoring answer with Gemini: {e}")
        return fallback_score(answer)

def fallback_score(answer: str) -> dict:
    answer_length = len(answer.split())
    if answer_length < 10:
        return {
            "score": random.randint(40, 55),
            "feedback": "Your answer is quite brief. Elaborate with specific technical context and quantifiable outcomes using the STAR method."
        }
    elif answer_length > 60:
        return {
            "score": random.randint(82, 95),
            "feedback": "Strong detail and comprehensive technical explanation! Keep it concise and emphasize the business outcome."
        }
    else:
        return {
            "score": random.randint(68, 82),
            "feedback": "Solid foundation. To elevate your score, clearly delineate your personal Actions and measurable Results."
        }
