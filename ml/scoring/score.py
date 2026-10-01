import os
import random
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

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
        
        Evaluate the candidate's answer based on clarity, technical completeness, problem-solving, and the STAR method (Situation, Task, Action, Result).
        Provide a score from 0 to 100 and brief constructive feedback.
        Output MUST be ONLY valid JSON: {{"score": 85, "feedback": "Your constructive feedback here"}}
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if not raw_resp:
            return fallback_score(answer)

        json_text = clean_json_response(raw_resp)
        result = json.loads(json_text)
        return {
            "score": int(result.get("score", 75)),
            "feedback": str(result.get("feedback", "Good effort. Consider detailing measurable outcomes."))
        }
    except Exception as e:
        print(f"Error scoring answer with Gemini: {e}")
        return fallback_score(answer)

def fallback_score(answer: str) -> dict:
    answer_length = len(answer.split())
    if answer_length < 10:
        return {
            "score": random.randint(35, 50),
            "feedback": "Your answer is quite brief. Elaborate with specific technical context and quantifiable outcomes using the STAR method."
        }
    elif answer_length > 60:
        return {
            "score": random.randint(80, 95),
            "feedback": "Strong detail and comprehensive technical explanation! Keep it concise and emphasize the business outcome."
        }
    else:
        return {
            "score": random.randint(65, 80),
            "feedback": "Solid foundation. To elevate your score, clearly delineate your personal Actions and measurable Results."
        }
