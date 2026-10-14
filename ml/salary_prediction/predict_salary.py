import os
import csv
import random
import json
import re
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def _clean_salary(val, default: int) -> int:
    if val is None:
        return default
    try:
        raw = str(val).lower()
        # Handle cases like "18 LPA" or "18.5 LPA" or "18 Lakhs"
        lpa_match = re.search(r'([\d.]+)\s*(?:lpa|lakh|lac)', raw)
        if lpa_match:
            lacs = float(lpa_match.group(1))
            return int(lacs * 100000)
            
        cleaned = raw.replace("₹", "").replace("$", "").replace("inr", "").replace("rs.", "").replace("rs", "").replace(",", "").strip()
        parsed = int(float(cleaned))
        # If model returned in LPA (e.g., 18 or 24 instead of 1800000)
        if 2 <= parsed <= 150:
            parsed = parsed * 100000
        return parsed if parsed > 0 else default
    except Exception:
        return default

def predict_salary_range(role: str, experience_years: int = 2) -> dict:
    """
    Predicts salary ranges in Indian Rupees (INR) using Gemini LLM for up-to-date
    Indian tech market compensation data, with robust number sanitization and grounded local fallback.
    """
    selected_role = role or "Software Engineer"
    if not get_gemini_api_key():
        return fallback_salary(selected_role, experience_years)

    try:
        prompt = f"""
        Act as a senior compensation and tech talent analyst for the Indian tech market.
        What is the realistic current market salary range in Indian Rupees (INR / LPA) for a {selected_role} in India (e.g., Bengaluru, Hyderabad, Pune, Gurgaon, Remote) with {experience_years} years of relevant experience?
        Output MUST be ONLY valid JSON with exact keys (values in total annual INR, e.g. 1800000 for 18 LPA):
        {{"min_salary": 1200000, "max_salary": 2200000, "median_salary": 1600000, "currency": "INR", "role": "{selected_role}"}}
        """
        raw_resp = call_gemini_api(prompt, temperature=0.1)
        if not raw_resp:
            return fallback_salary(selected_role, experience_years)

        json_text = clean_json_response(raw_resp)
        result = json.loads(json_text)
        
        min_sal = _clean_salary(result.get("min_salary"), 1200000)
        max_sal = _clean_salary(result.get("max_salary"), 2400000)
        med_sal = _clean_salary(result.get("median_salary"), (min_sal + max_sal) // 2)

        # Ensure min <= median <= max integrity
        if min_sal > max_sal:
            min_sal, max_sal = max_sal, min_sal
        if not (min_sal <= med_sal <= max_sal):
            med_sal = (min_sal + max_sal) // 2

        return {
            "min_salary": min_sal,
            "max_salary": max_sal,
            "median_salary": med_sal,
            "currency": "INR",
            "role": str(result.get("role", selected_role))
        }
    except Exception as e:
        print(f"Error predicting salary: {e}")
        return fallback_salary(selected_role, experience_years)

def fallback_salary(role: str, experience_years: int = 2) -> dict:
    base_salaries = {
        "Software Engineer": 1400000,
        "Data Scientist": 1800000,
        "Product Manager": 2000000,
        "Frontend Developer": 1200000,
        "Backend Engineer": 1500000,
        "Full Stack Developer": 1600000,
        "Senior Full-Stack & AI Engineer": 2400000,
        "DevOps Engineer": 1600000,
        "AI/ML Engineer": 2000000
    }
    
    base = base_salaries.get(role, 1400000)
    base += (experience_years * 180000)
    variance = random.randint(-40000, 40000)
    median = base + variance
    
    return {
        "min_salary": int(median * 0.82),
        "max_salary": int(median * 1.25),
        "median_salary": median,
        "currency": "INR",
        "role": role
    }
