import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_chat_response(message: str) -> str:
    """
    RAG (Retrieval-Augmented Generation) pipeline using Gemini.
    """
    if not os.environ.get("GEMINI_API_KEY"):
        # Fallback if key is not configured
        return fallback_mock_response(message)
        
    try:
        prompt = f"You are an AI Career Coach. Help the user with their career goals. User says: {message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating response: {e}")
        return fallback_mock_response(message)

def fallback_mock_response(message: str) -> str:
    message_lower = message.lower()
    
    if "resume" in message_lower or "cv" in message_lower:
        return "I can help you analyze your resume! Try uploading it on the Dashboard. I'll extract your skills and suggest career matches."
    elif "salary" in message_lower or "pay" in message_lower:
        return "You can check the Salary Estimator on your dashboard to see market rates for your predicted career paths."
    elif "interview" in message_lower or "practice" in message_lower:
        return "Head over to the Interview Prep section to practice answering questions. I'll give you real-time feedback and scoring."
    else:
        return f"That's an interesting point about '{message}'. As an AI career coach, I'm here to help you navigate your career path. Can you tell me more about your specific goals?"
