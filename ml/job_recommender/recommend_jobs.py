import random
import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def predict_jobs(skills: list) -> list:
    """
    Recommends job listings based on skills using Gemini to generate realistic matches.
    """
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here" or not skills:
        return fallback_predict_jobs(skills)
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Given the following candidate skills: {', '.join(skills)}
        Recommend 3 realistic job postings that match these skills.
        Return ONLY a JSON list of objects with the following keys: "title", "company", "location", "match_score" (integer 0-100), "url".
        Make the data look realistic.
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        jobs = json.loads(text_resp)
        if isinstance(jobs, list):
            return sorted(jobs, key=lambda x: x.get('match_score', 0), reverse=True)
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
            "match_score": random.randint(80, 98),
            "url": "https://example.com/job/1"
        },
        {
            "title": "Backend Python Developer",
            "company": "InnovateAI",
            "location": "New York, NY",
            "match_score": random.randint(75, 95),
            "url": "https://example.com/job/2"
        },
        {
            "title": "Frontend React Developer",
            "company": "WebSolutions",
            "location": "San Francisco, CA",
            "match_score": random.randint(70, 90),
            "url": "https://example.com/job/3"
        }
    ]
    
    return sorted(jobs, key=lambda x: x['match_score'], reverse=True)
