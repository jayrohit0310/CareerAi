import os
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def predict_courses(skills: list) -> list:
    """
    Recommends high-yield online courses based on candidate skills using Gemini.
    """
    if not get_gemini_api_key() or not skills:
        return fallback_predict_courses(skills)
        
    try:
        prompt = f"""
        Given candidate skills: {', '.join(skills)}
        Recommend 3 realistic high-impact online courses (from Coursera, Udemy, edX, etc.) to level up or close skill gaps.
        Return ONLY a JSON list of objects with the exact keys: "title", "platform", "url", "reason".
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if raw_resp:
            json_text = clean_json_response(raw_resp)
            courses = json.loads(json_text)
            if isinstance(courses, list) and len(courses) > 0:
                return courses
        return fallback_predict_courses(skills)
    except Exception as e:
        print(f"Error predicting courses: {e}")
        return fallback_predict_courses(skills)

def fallback_predict_courses(skills: list) -> list:
    courses = [
        {
            "title": "Advanced Python for Data Science and Backend",
            "platform": "Coursera",
            "url": "https://coursera.org",
            "reason": "Great for building an enterprise-grade foundation in data and APIs."
        },
        {
            "title": "System Design & Distributed Systems",
            "platform": "Udemy",
            "url": "https://udemy.com",
            "reason": "Crucial for transitioning to Senior and Lead engineering positions."
        },
        {
            "title": "Full-Stack React & Next.js Architecture",
            "platform": "Coursera",
            "url": "https://coursera.org",
            "reason": "Master modern frontends, SSR, and production performance optimization."
        }
    ]
    return courses
