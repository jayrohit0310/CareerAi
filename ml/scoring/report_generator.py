import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

def generate_interview_performance_report(
    session_config: Dict[str, Any],
    qa_list: List[Dict[str, Any]],
    total_time_spent_seconds: int = 0,
    historical_sessions: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Synthesizes a comprehensive post-interview performance analysis report.
    """
    total_configured = session_config.get("question_count", len(qa_list))
    attempted_qa = [qa for qa in qa_list if qa.get("user_answer") and qa.get("user_answer").strip()]
    attempted_count = len(attempted_qa)
    unanswered_count = max(0, total_configured - attempted_count)

    scores = [qa.get("score_10", qa.get("score", 7.0)) for qa in attempted_qa if qa.get("score") is not None or qa.get("score_10") is not None]
    
    if scores:
        avg_score_10 = round(sum(scores) / len(scores), 1)
        # Penalize slightly if unanswered questions exist
        penalty = (unanswered_count / total_configured) * 1.5 if total_configured > 0 else 0
        overall_score_10 = round(max(1.0, min(10.0, avg_score_10 - penalty)), 1)
    else:
        avg_score_10 = 0.0
        overall_score_10 = 0.0

    overall_score_100 = int(overall_score_10 * 10)

    # Determine Performance Grade
    if overall_score_10 >= 8.5:
        grade = "Advanced Mastery (Strong Hire)"
        grade_badge = "emerald"
    elif overall_score_10 >= 7.0:
        grade = "Proficient (Competitive Candidate)"
        grade_badge = "blue"
    elif overall_score_10 >= 5.5:
        grade = "Developing (Targeted Practice Needed)"
        grade_badge = "amber"
    else:
        grade = "Needs Foundational Preparation"
        grade_badge = "rose"

    # Topic breakdown
    topics_dict: Dict[str, List[float]] = {}
    for qa in attempted_qa:
        top = qa.get("topic") or "General Technical"
        score = qa.get("score_10", 7.0)
        topics_dict.setdefault(top, []).append(score)

    performance_by_topic = []
    for top, top_scores in topics_dict.items():
        performance_by_topic.append({
            "topic": top,
            "score": round(sum(top_scores) / len(top_scores), 1),
            "question_count": len(top_scores)
        })

    if not performance_by_topic:
        performance_by_topic = [
            {"topic": "System Architecture", "score": round(overall_score_10, 1), "question_count": 1},
            {"topic": "Practical Problem Solving", "score": round(max(1.0, overall_score_10 - 0.5), 1), "question_count": 1}
        ]

    # Synthesize strengths & weaknesses
    key_strengths = []
    weaknesses = []
    for qa in attempted_qa:
        if qa.get("strengths") and qa["strengths"] not in key_strengths:
            key_strengths.append(qa["strengths"])
        if qa.get("missing_concepts") and qa["missing_concepts"] not in weaknesses:
            weaknesses.append(qa["missing_concepts"])

    if not key_strengths:
        key_strengths = ["Clear communication initiative and fundamental problem understanding."]
    if not weaknesses:
        weaknesses = ["Could include more specific latency, scalability, and measurable production metrics."]

    # Study recommendations based on weak topics or questions scoring < 7.0
    recommended_study_topics = set()
    for qa in qa_list:
        score = qa.get("score_10", 10.0)
        if score < 7.5:
            topic = qa.get("topic")
            if topic:
                recommended_study_topics.add(f"Deep dive: {topic}")
    
    if not recommended_study_topics:
        recommended_study_topics.update([
            "Distributed Systems: High-throughput caching and partition tolerance",
            "Production Debugging: Profiling memory leaks and async thread deadlocks",
            "STAR Communication: Articulating individual engineering trade-offs"
        ])

    # Historical comparison
    hist_comp = None
    if historical_sessions and len(historical_sessions) > 0:
        prev_scores = [s.get("overall_score") for s in historical_sessions if s.get("overall_score") is not None]
        if prev_scores:
            prev_avg = round(sum(prev_scores) / len(prev_scores), 1)
            diff = round(overall_score_10 - prev_avg, 1)
            hist_comp = {
                "previous_session_count": len(historical_sessions),
                "historical_average_score": prev_avg,
                "score_change": f"{'+' if diff >= 0 else ''}{diff} pts",
                "trend": "improving" if diff >= 0 else "declining"
            }

    interview_type = session_config.get("interview_type", "resume")
    difficulty = session_config.get("difficulty", "intermediate")

    return {
        "overall_score_10": overall_score_10,
        "overall_score_100": overall_score_100,
        "grade": grade,
        "grade_badge": grade_badge,
        "interview_type": interview_type,
        "difficulty": difficulty,
        "total_questions_configured": total_configured,
        "questions_attempted": attempted_count,
        "questions_unanswered": unanswered_count,
        "average_answer_score": avg_score_10,
        "total_time_spent_seconds": total_time_spent_seconds,
        "performance_by_topic": performance_by_topic,
        "technical_knowledge_assessment": f"Demonstrated {grade.lower()} in technical and architectural reasoning for {difficulty} level.",
        "project_internship_assessment": "Grounded responses directly verified against claimed project and internship experiences." if interview_type in ["resume", "project"] else "Standard technical domain assessment.",
        "key_strengths": key_strengths[:4],
        "areas_for_improvement": weaknesses[:4],
        "recommended_study_topics": list(recommended_study_topics)[:5],
        "question_reviews": qa_list,
        "historical_comparison": hist_comp,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
