import os
import random
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def predict_salary_range(role: str, experience_years: int = 2) -> dict:
    """
    Predicts salary ranges using Gemini LLM for up-to-date market compensation data.
    """
    if not get_gemini_api_key():
        return fallback_salary(role, experience_years)

    try:
        prompt = f"""
        Act as a senior compensation and tech talent analyst.
        What is the realistic current market salary range in USD for a {role} with {experience_years} years of relevant experience?
        Output MUST be ONLY valid JSON with exact keys:
        {{"min_salary": 90000, "max_salary": 130000, "median_salary": 110000, "currency": "USD", "role": "{role}"}}
        """
        raw_resp = call_gemini_api(prompt, temperature=0.1)
        if not raw_resp:
            return fallback_salary(role, experience_years)

        json_text = clean_json_response(raw_resp)
        result = json.loads(json_text)
        return {
            "min_salary": int(result.get("min_salary", 70000)),
            "max_salary": int(result.get("max_salary", 110000)),
            "median_salary": int(result.get("median_salary", 90000)),
            "currency": result.get("currency", "USD"),
            "role": result.get("role", role)
        }
    except Exception as e:
        print(f"Error predicting salary: {e}")
        return fallback_salary(role, experience_years)

def fallback_salary(role: str, experience_years: int = 2) -> dict:
    base_salaries = {
        "Software Engineer": 90000,
        "Data Scientist": 105000,
        "Product Manager": 110000,
        "Frontend Developer": 85000,
        "Backend Engineer": 95000,
        "Full Stack Developer": 100000,
        "DevOps Engineer": 105000,
        "AI/ML Engineer": 115000
    }
    
    base = base_salaries.get(role, 80000)
    base += (experience_years * 6000)
    variance = random.randint(-3000, 3000)
    median = base + variance
    
    return {
        "min_salary": int(median * 0.82),
        "max_salary": int(median * 1.22),
        "median_salary": median,
        "currency": "USD",
        "role": role
    }
