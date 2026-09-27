import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def predict_courses(skills: list) -> list:
    """
    Recommends courses based on skills using Gemini.
    """
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here" or not skills:
        return fallback_predict_courses(skills)
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Given the following candidate skills: {', '.join(skills)}
        Recommend 3 realistic online courses (from Coursera, Udemy, edX, etc.) that would help them level up or learn related in-demand skills.
        Return ONLY a JSON list of objects with the following keys: "title", "platform", "url", "reason".
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        courses = json.loads(text_resp)
        if isinstance(courses, list):
            return courses
        return fallback_predict_courses(skills)
    except Exception as e:
        print(f"Error predicting courses: {e}")
        return fallback_predict_courses(skills)

def fallback_predict_courses(skills: list) -> list:
    courses = [
        {
            "title": "Advanced Python for Data Science",
            "platform": "Coursera",
            "url": "https://coursera.org",
            "reason": "Great for building a strong foundation in data manipulation."
        },
        {
            "title": "System Design Interview Prep",
            "platform": "Udemy",
            "url": "https://udemy.com",
            "reason": "Crucial for transitioning to Senior engineering roles."
        },
        {
            "title": "React - The Complete Guide",
            "platform": "Udemy",
            "url": "https://udemy.com",
            "reason": "Master frontend development and build modern UI components."
        }
    ]
    return courses
