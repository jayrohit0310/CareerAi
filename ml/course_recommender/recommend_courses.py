import os
import csv
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def predict_courses(skills: list) -> list:
    """
    Recommends high-yield online courses based on candidate skills using Gemini,
    with robust fallback grounded in the local curriculum catalog.
    """
    cleaned_skills = [str(s).strip() for s in skills if str(s).strip()]
    if not get_gemini_api_key() or not cleaned_skills:
        return fallback_predict_courses(cleaned_skills)
        
    try:
        prompt = f"""
        Given candidate skills: {', '.join(cleaned_skills)}
        Recommend 3 realistic high-impact online courses (from Coursera, Udemy, edX, etc.) to level up or close skill gaps.
        Return ONLY a JSON list of objects with the exact keys: "title", "platform", "url", "reason".
        """
        raw_resp = call_gemini_api(prompt, temperature=0.2)
        if raw_resp:
            json_text = clean_json_response(raw_resp)
            courses = json.loads(json_text)
            if isinstance(courses, list) and len(courses) > 0:
                sanitized_courses = []
                for c in courses:
                    if isinstance(c, dict):
                        sanitized_courses.append({
                            "title": str(c.get("title", "Full Stack Development")),
                            "platform": str(c.get("platform", "Coursera")),
                            "url": str(c.get("url", "https://coursera.org")),
                            "reason": str(c.get("reason", "Enhances foundational engineering skills."))
                        })
                if sanitized_courses:
                    return sanitized_courses
        return fallback_predict_courses(cleaned_skills)
    except Exception as e:
        print(f"Error predicting courses: {e}")
        return fallback_predict_courses(cleaned_skills)

def fallback_predict_courses(skills: list) -> list:
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/courses.csv"))
    skills_lower = [s.lower() for s in skills]

    matched_courses = []
    if os.path.exists(csv_path):
        try:
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    course_skills = [sk.strip().lower() for sk in row.get("skills", "").split(",")]
                    # Check match or skill gap coverage
                    overlap = any(cs in user_sk or user_sk in cs for cs in course_skills for user_sk in skills_lower)
                    if overlap or not skills:
                        matched_courses.append({
                            "title": row.get("title", "Advanced Software Development"),
                            "platform": row.get("provider", "Coursera"),
                            "url": f"https://www.coursera.org/search?query={row.get('title', '').replace(' ', '+')}",
                            "reason": f"Directly sharpens core competency in {row.get('skills', 'software systems')}."
                        })
        except Exception as e:
            print(f"Error reading courses.csv: {e}")

    if not matched_courses:
        matched_courses = [
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
    return matched_courses[:4]
