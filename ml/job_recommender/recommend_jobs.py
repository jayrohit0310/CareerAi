import random
import os
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def predict_jobs(skills: list) -> list:
    """
    Recommends realistic job listings based on candidate skills using Gemini.
    """
    if not get_gemini_api_key() or not skills:
        return fallback_predict_jobs(skills)
        
    try:
        prompt = f"""
        Given candidate skills: {', '.join(skills)}
        Recommend 3 realistic tech job openings that closely match these skills.
        Return ONLY a JSON list of objects with the exact keys: "title", "company", "location", "match_score" (integer 0-100), "url".
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if raw_resp:
            json_text = clean_json_response(raw_resp)
            jobs = json.loads(json_text)
            if isinstance(jobs, list) and len(jobs) > 0:
                return sorted(jobs, key=lambda x: x.get('match_score', 80), reverse=True)
        return fallback_predict_jobs(skills)
    except Exception as e:
        print(f"Error predicting jobs: {e}")
        return fallback_predict_jobs(skills)

def fallback_predict_jobs(skills: list) -> list:
    jobs = [
        {
            "title": "Software Engineer II",
            "company": "TechCorp",
            "location": "Remote",
            "match_score": random.randint(85, 98),
            "url": "https://example.com/job/1"
        },
        {
            "title": "Backend Python Developer",
            "company": "InnovateAI",
            "location": "New York, NY",
            "match_score": random.randint(80, 95),
            "url": "https://example.com/job/2"
        },
        {
            "title": "Frontend React Developer",
            "company": "WebSolutions",
            "location": "San Francisco, CA",
            "match_score": random.randint(75, 92),
            "url": "https://example.com/job/3"
        }
    ]
    return sorted(jobs, key=lambda x: x['match_score'], reverse=True)
