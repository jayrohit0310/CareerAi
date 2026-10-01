import os
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def predict_career_matches(skills: list) -> list:
    """
    Predicts career matches based on skills using Gemini to generate dynamic roles.
    """
    if not get_gemini_api_key() or not skills:
        return fallback_predict_career_matches(skills)
        
    try:
        prompt = f"""
        Given the following candidate skills: {', '.join(skills)}
        Recommend 3 potential career roles that strongly match these skills.
        Return ONLY a JSON list of objects with the following keys: "title", "match_percentage" (integer 0-100), "description".
        No other text.
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if not raw_resp:
            return fallback_predict_career_matches(skills)

        json_text = clean_json_response(raw_resp)
        careers = json.loads(json_text)
        if isinstance(careers, list):
            cleaned = []
            for c in careers:
                raw_pct = c.get('match_percentage', 80)
                try:
                    pct = int(float(str(raw_pct).replace('%', '').strip()))
                except Exception:
                    pct = 80
                cleaned.append({
                    "title": str(c.get("title", "Software Engineer")),
                    "match_percentage": pct,
                    "description": str(c.get("description", "Analyzes technical requirements and develops software systems."))
                })
            return sorted(cleaned, key=lambda x: x['match_percentage'], reverse=True)
        return fallback_predict_career_matches(skills)
    except Exception as e:
        print(f"Error predicting career matches: {e}")
        return fallback_predict_career_matches(skills)

def fallback_predict_career_matches(skills: list) -> list:
    has_python = any('python' in s.lower() for s in skills)
    has_react = any('react' in s.lower() for s in skills)
    
    matches = []
    if has_python:
        matches.append({"title": "Data Scientist", "match_percentage": 92, "description": "Analyzes complex data to extract insights using Python."})
        matches.append({"title": "Backend Engineer", "match_percentage": 88, "description": "Develops server-side logic and APIs."})
    if has_react:
        matches.append({"title": "Frontend Developer", "match_percentage": 95, "description": "Builds user interfaces using React."})
        matches.append({"title": "Full Stack Developer", "match_percentage": 82, "description": "Handles both frontend and backend development."})
        
    if not matches:
        matches = [
            {"title": "Software Engineer", "match_percentage": 75, "description": "Develops and maintains software systems."},
            {"title": "IT Support Specialist", "match_percentage": 60, "description": "Provides technical assistance and support."}
        ]
        
    return sorted(matches, key=lambda x: x['match_percentage'], reverse=True)
