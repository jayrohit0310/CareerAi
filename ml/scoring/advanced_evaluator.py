import json
import random
from typing import Dict, Any, Optional
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def evaluate_interview_response(
    question: str,
    answer: str,
    difficulty: str = "intermediate",
    question_type: str = "technical",
    topic: str = "Engineering",
    resume_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates candidate's interview response using multi-dimensional criteria:
    - Technical correctness
    - Conceptual depth & clarity
    - STAR structure & practical examples
    - Resume claim consistency (if applicable)
    Returns:
    - score_10 (float 0.0 - 10.0)
    - score_100 (int 0 - 100)
    - strengths (str)
    - missing_concepts (str)
    - improvement_suggestions (str)
    - ideal_answer (str)
    - follow_up (optional str)
    - disclaimer (str)
    """
    clean_ans = (answer or "").strip()
    words = clean_ans.split()
    word_count = len(words)

    # Empty or very trivial answer
    if word_count < 4:
        return _empty_or_too_short_evaluation(question, difficulty)

    if get_gemini_api_key():
        try:
            prompt = f"""
You are an expert technical interviewer and engineering director assessing a candidate's answer.

QUESTION ASKED:
"{question}"

CANDIDATE RESPONSE:
"{clean_ans}"

CONTEXT & DIFFICULTY:
- Difficulty Level: {difficulty.upper()} (Beginner, Intermediate, Advanced)
- Question Category: {question_type}
- Primary Topic: {topic}
{("- Resume Context: " + resume_context) if resume_context else ""}

SCORING CRITERIA:
1. Technical Correctness (35%): Accuracy of technologies, algorithms, and concepts mentioned.
2. Conceptual Depth (25%): Depth of reasoning according to difficulty level ({difficulty.upper()}).
3. Completeness & Structure (20%): STAR method (Situation, Task, Action, Result) or structured problem breakdown.
4. Practical Application (20%): Concrete examples, trade-offs, and measurable outcomes.
5. Authenticity: For resume/project questions, does the answer demonstrate firsthand implementation knowledge?

DIFFICULTY EXPECTATIONS:
- BEGINNER: Basic definitions, syntax accuracy, understanding of core principles. Score generously for clear explanations.
- INTERMEDIATE: Must articulate architectural decisions, component interactions, trade-offs, and practical edge-cases.
- ADVANCED: Demands deep systems understanding, scalability bottlenecks, failure modes, concurrency, and quantifiable business/engineering outcomes.

Output MUST be ONLY valid JSON matching this schema:
{{
  "score_10": 8.5,
  "score_100": 85,
  "strengths": "Clear breakdown of architectural layers and decisive action verbs.",
  "missing_concepts": "Did not mention database indexing or cache invalidation strategies.",
  "improvement_suggestions": "Quantify production impact using specific metrics (e.g. latency down 35%).",
  "ideal_answer": "An exemplary high-scoring answer demonstrating complete technical mastery.",
  "needs_followup": false,
  "followup_question": ""
}}
"""
            raw_resp = call_gemini_api(prompt, temperature=0.2, max_tokens=1000)
            if raw_resp:
                cleaned = clean_json_response(raw_resp)
                result = json.loads(cleaned)
                if isinstance(result, dict) and "score_10" in result:
                    score_10 = round(float(result.get("score_10", 7.5)), 1)
                    score_100 = int(result.get("score_100", int(score_10 * 10)))
                    
                    return {
                        "score_10": max(0.0, min(10.0, score_10)),
                        "score_100": max(0, min(100, score_100)),
                        "strengths": str(result.get("strengths", "Good structured answer with relevant context.")),
                        "missing_concepts": str(result.get("missing_concepts", "Consider detailing edge-case handling.")),
                        "improvement_suggestions": str(result.get("improvement_suggestions", "Elaborate with quantifiable metrics.")),
                        "ideal_answer": str(result.get("ideal_answer", _generate_fallback_ideal_answer(question, topic))),
                        "needs_followup": bool(result.get("needs_followup", False)),
                        "followup_question": str(result.get("followup_question") or "").strip(),
                        "disclaimer": "AI evaluations are automated estimates designed for preparation and practice."
                    }
        except Exception as e:
            print(f"Gemini advanced evaluation failed, using fallback evaluator: {e}")

    # Fallback heuristic evaluation
    return _fallback_evaluation(question, clean_ans, difficulty, topic)


def _empty_or_too_short_evaluation(question: str, difficulty: str) -> Dict[str, Any]:
    return {
        "score_10": 2.0,
        "score_100": 20,
        "strengths": "Answer was initiated.",
        "missing_concepts": "The answer was too brief to evaluate technical depth, problem-solving, or outcomes.",
        "improvement_suggestions": "Use the STAR method: explain the Situation, your specific Tasks, technical Actions, and measurable Results.",
        "ideal_answer": _generate_fallback_ideal_answer(question, "Technical Problem"),
        "needs_followup": True,
        "followup_question": "Could you provide a detailed technical walkthrough with specific implementation details?",
        "disclaimer": "AI evaluations are automated estimates designed for preparation and practice."
    }


def _fallback_evaluation(question: str, answer: str, difficulty: str, topic: str) -> Dict[str, Any]:
    words = len(answer.split())
    
    # Calculate baseline based on length, keywords, and difficulty
    tech_keywords = ["architecture", "database", "api", "latency", "scale", "performance", "cache", "query", "testing", "async", "docker", "pipeline"]
    kw_count = sum(1 for kw in tech_keywords if kw in answer.lower())
    
    base = 6.0
    if words > 40: base += 1.5
    if words > 80: base += 1.0
    if kw_count >= 2: base += 0.8
    if kw_count >= 4: base += 0.7

    if difficulty == "advanced":
        base -= 1.0
    elif difficulty == "beginner":
        base += 0.8

    score_10 = round(max(3.5, min(9.4, base)), 1)
    score_100 = int(score_10 * 10)

    strengths = "Good initiative. You provided relevant contextual background and identified the key technical problem."
    missing_concepts = "Could dive deeper into specific architectural trade-offs, testing methodologies, and scalability implications."
    improvements = "Structure your answer using STAR: clearly articulate the individual engineering decisions you made and the quantifiable business outcomes."

    return {
        "score_10": score_10,
        "score_100": score_100,
        "strengths": strengths,
        "missing_concepts": missing_concepts,
        "improvement_suggestions": improvements,
        "ideal_answer": _generate_fallback_ideal_answer(question, topic),
        "needs_followup": False,
        "followup_question": "",
        "disclaimer": "AI evaluations are automated estimates designed for preparation and practice."
    }


def _generate_fallback_ideal_answer(question: str, topic: str) -> str:
    return (
        f"A strong answer begins with the architectural context: 'When approaching {topic}, I first evaluate the system requirements and trade-offs.' "
        "Next, detail the technical implementation: 'I architected the service with modular separation of concerns, implemented connection pooling, and secured endpoints using JWT authentication.' "
        "Conclude with measurable outcomes: 'As a result, we reduced endpoint latency by 35% and maintained zero downtime during traffic spikes.'"
    )
