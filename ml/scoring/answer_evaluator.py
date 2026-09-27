def evaluate_answer(question: str, answer: str) -> dict:
    """
    Evaluate an interview answer. Returns a score and feedback.
    """
    # Dummy logic: score based on length of the answer
    length = len(answer.split())
    if length > 50:
        return {"score": 90, "feedback": "Excellent detailed answer with great context."}
    elif length > 20:
        return {"score": 75, "feedback": "Good answer, but could use more detail and examples."}
    else:
        return {"score": 50, "feedback": "The answer is too brief. Try to use the STAR method to provide more context."}
