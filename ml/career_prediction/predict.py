import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def predict_career_matches(skills: list) -> list:
    """
    Predicts career matches based on skills using Gemini to generate dynamic roles.
    """
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here" or not skills:
        return fallback_predict_career_matches(skills)
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Given the following candidate skills: {', '.join(skills)}
        Recommend 3 potential career roles that strongly match these skills.
        Return ONLY a JSON list of objects with the following keys: "title", "match_percentage" (integer 0-100), "description".
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        careers = json.loads(text_resp)
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
