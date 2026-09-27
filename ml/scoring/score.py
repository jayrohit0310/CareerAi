import os
import random
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def score_interview_answer(question: str, answer: str) -> dict:
    """
    Evaluates interview answers using Gemini LLM and provides score and feedback.
    """
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here":
        return fallback_score(answer)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are an expert technical interviewer.
        Question asked: {question}
        Candidate answer: {answer}
        
        Evaluate the candidate's answer based on clarity, completeness, and the STAR method (if applicable).
        Provide a score from 0 to 100 and brief constructive feedback.
        Output MUST be in JSON format: {{"score": 85, "feedback": "Your feedback here"}}
        """
        response = model.generate_content(prompt)
        # Parse JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        
        result = json.loads(text)
        return {
            "score": result.get("score", 70),
            "feedback": result.get("feedback", "Good effort.")
        }
    except Exception as e:
        print(f"Error scoring answer: {e}")
        return fallback_score(answer)

def fallback_score(answer: str) -> dict:
    answer_length = len(answer.split())
    
    if answer_length < 10:
        return {
            "score": random.randint(30, 50),
            "feedback": "Your answer is quite short. Try to elaborate more and provide specific examples using the STAR method."
        }
    elif answer_length > 100:
        return {
            "score": random.randint(75, 95),
            "feedback": "Great detail! You provided a comprehensive answer. Make sure to keep it concise and focused on the key points."
        }
    else:
        return {
            "score": random.randint(60, 85),
            "feedback": "Good answer. To improve, try structuring it more clearly with a specific Situation, Task, Action, and Result."
        }
