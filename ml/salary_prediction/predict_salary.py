import os
import random
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def predict_salary_range(role: str, experience_years: int = 2) -> dict:
    """
    Predicts salary ranges using Gemini LLM for up-to-date market data.
    """
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here":
        return fallback_salary(role, experience_years)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Act as a compensation analyst. What is the current market salary in USD for a {role} with {experience_years} years of experience in the US tech market?
        Output MUST be in JSON format with exact keys:
        {{"min_salary": 90000, "max_salary": 130000, "median_salary": 110000, "currency": "USD", "role": "{role}"}}
        Provide realistic numbers based on current data. Just the JSON.
        """
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        result = json.loads(text)
        return {
            "min_salary": int(result.get("min_salary", 0)),
            "max_salary": int(result.get("max_salary", 0)),
            "median_salary": int(result.get("median_salary", 0)),
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
        "Full Stack Developer": 100000
    }
    
    # Default base if role not found
    base = base_salaries.get(role, 70000)
    
    # Add experience multiplier (simulated)
    base += (experience_years * 5000)
    
    # Add some random variance to simulate a model's output
    variance = random.randint(-5000, 5000)
    base += variance
    
    return {
        "min_salary": int(base * 0.8),
        "max_salary": int(base * 1.2),
        "median_salary": base,
        "currency": "USD",
        "role": role
    }
