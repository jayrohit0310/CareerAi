def generate_questions(role: str) -> list:
    """
    Generate interview questions based on the requested role.
    """
    questions = []
    if "frontend" in role.lower() or "react" in role.lower():
        questions = [
            "What is the virtual DOM in React?",
            "Can you explain React hooks?",
            "How do you optimize a React application?"
        ]
    elif "backend" in role.lower() or "python" in role.lower():
        questions = [
            "What are decorators in Python?",
            "Explain RESTful API principles.",
            "How do you handle database migrations?"
        ]
    else:
        questions = [
            "Tell me about a time you faced a difficult challenge at work.",
            "What is your greatest weakness?",
            "Where do you see yourself in 5 years?"
        ]
    return questions
