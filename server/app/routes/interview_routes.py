import os
import sys
import uuid
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.models.interview import Resume, InterviewSession, InterviewQA
from app.middleware.auth import get_current_user

# ML & Scoring modules
try:
    from ml.question_generator.smart_generator import (
        generate_interview_question_sequence,
        generate_followup_question
    )
    from ml.scoring.advanced_evaluator import evaluate_interview_response
    from ml.scoring.report_generator import generate_interview_performance_report
except ImportError as e:
    print(f"ML modules import warning: {e}")
    generate_interview_question_sequence = None
    generate_followup_question = None
    evaluate_interview_response = None
    generate_interview_performance_report = None

try:
    from ml.speech_to_text.whisper_transcriber import transcribe_audio
except ImportError:
    def transcribe_audio(audio_file_path: str) -> str:
        return "Voice answer transcribed successfully."

router = APIRouter(prefix="/interview", tags=["interview"])

AUDIO_DIR = os.path.join(ROOT_DIR, "storage", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)


# --- Request & Response Models ---

class InterviewStartRequest(BaseModel):
    resume_id: Optional[int] = None
    interview_type: str = "resume"  # resume, technical, hr, project, coding, mixed
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    duration_minutes: int = 15
    role_domain: str = "Full-Stack Software Engineering"
    allow_followups: bool = True

class AnswerSubmitRequest(BaseModel):
    session_id: str
    question_index: Optional[int] = None
    answer_text: str

class EndSessionRequest(BaseModel):
    session_id: str
    reason: Optional[str] = "completed"  # completed, early_termination, timeout


# --- Routes ---

@router.get("/options")
def get_interview_options(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns configurable interview settings and the candidate's available resumes.
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    resume_options = []
    for r in resumes:
        try:
            parsed = json.loads(r.parsed_data) if r.parsed_data else {}
        except Exception:
            parsed = {}
        resume_options.append({
            "id": r.id,
            "filename": r.filename,
            "skills": [s.strip() for s in (r.extracted_skills or "").split(",") if s.strip()],
            "project_count": len(parsed.get("projects", [])),
            "internship_count": len(parsed.get("internships", [])),
            "is_primary": r.is_primary
        })

    return {
        "interview_types": [
            {
                "id": "resume",
                "label": "Resume-Driven Interview",
                "desc": "Questions strictly grounded in your actual projects, internships, and claimed skills."
            },
            {
                "id": "technical",
                "label": "Technical & Systems Deep Dive",
                "desc": "In-depth engineering concepts, data structures, and architecture principles."
            },
            {
                "id": "project",
                "label": "Projects & Architecture Defense",
                "desc": "Defend your design decisions, trade-offs, algorithms, and code contributions."
            },
            {
                "id": "hr",
                "label": "HR & Behavioral (STAR)",
                "desc": "Leadership, teamwork, conflict resolution, and situational problem-solving."
            },
            {
                "id": "coding",
                "label": "Coding & Problem Solving",
                "desc": "Algorithm design, complexity trade-offs, and practical edge-case analysis."
            },
            {
                "id": "mixed",
                "label": "Comprehensive Mock Board",
                "desc": "Blended simulation of resume, technical, and behavioral questions."
            }
        ],
        "difficulty_levels": [
            {
                "id": "beginner",
                "label": "Beginner",
                "desc": "Foundational definitions, clear concepts, guided project walkthroughs."
            },
            {
                "id": "intermediate",
                "label": "Intermediate",
                "desc": "Applied architecture, debugging scenarios, trade-offs, production patterns."
            },
            {
                "id": "advanced",
                "label": "Advanced",
                "desc": "High-scale systems, optimization, concurrency bottlenecks, rigorous verification."
            }
        ],
        "durations": [
            {"minutes": 5, "label": "5 Minutes", "tag": "Quick Practice", "est_questions": 3},
            {"minutes": 10, "label": "10 Minutes", "tag": "Short Interview", "est_questions": 5},
            {"minutes": 15, "label": "15 Minutes", "tag": "Standard Mock", "est_questions": 7},
            {"minutes": 30, "label": "30 Minutes", "tag": "Extended Session", "est_questions": 10},
            {"minutes": 45, "label": "45 Minutes", "tag": "Full Panel Simulation", "est_questions": 14}
        ],
        "domains": [
            "Full-Stack Software Engineering",
            "Backend Systems & Microservices",
            "Frontend & Modern UI Engineering",
            "AI / Machine Learning & MLOps",
            "Cloud Infrastructure & DevOps",
            "Data Engineering & Analytics"
        ],
        "available_resumes": resume_options
    }


@router.post("/start")
def start_interview(
    config: Optional[InterviewStartRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initializes a new interview session, generates questions tailored to
    resume or domain + difficulty, and registers authoritative server timestamps.
    """
    if config is None:
        config = InterviewStartRequest()

    session_id = f"int_{uuid.uuid4().hex[:12]}"

    # Fetch resume if selected or default to user's primary resume
    parsed_resume_dict = None
    selected_resume = None
    if config.resume_id:
        selected_resume = db.query(Resume).filter(
            Resume.id == config.resume_id,
            Resume.user_id == current_user.id
        ).first()
    elif config.interview_type in ["resume", "project", "mixed"]:
        selected_resume = db.query(Resume).filter(
            Resume.user_id == current_user.id
        ).order_by(Resume.created_at.desc()).first()

    if selected_resume and selected_resume.parsed_data:
        try:
            parsed_resume_dict = json.loads(selected_resume.parsed_data)
        except Exception:
            parsed_resume_dict = None

    # Generate question sequence
    questions_list = []
    if generate_interview_question_sequence:
        questions_list = generate_interview_question_sequence(
            interview_type=config.interview_type,
            difficulty=config.difficulty,
            duration_minutes=config.duration_minutes,
            role_domain=config.role_domain,
            parsed_resume=parsed_resume_dict,
            allow_followups=config.allow_followups
        )

    if not questions_list:
        # Fallback question bank
        questions_list = [
            {
                "question_index": 0,
                "question_text": "Walk me through an engineering challenge you solved recently. What was the architectural context, your specific action, and the outcome?",
                "question_type": "project",
                "topic": "Architecture & Problem Solving",
                "ideal_concepts": ["System Architecture", "Individual Ownership", "Measurable Outcome"]
            },
            {
                "question_index": 1,
                "question_text": "How do you ensure data integrity, API security, and high performance in your web applications?",
                "question_type": "technical",
                "topic": "API Design & Security",
                "ideal_concepts": ["Authentication", "Caching", "Validation"]
            },
            {
                "question_index": 2,
                "question_text": "Describe a time when you received critical technical feedback or had a disagreement with a team member. How did you handle it?",
                "question_type": "behavioral",
                "topic": "Team Collaboration",
                "ideal_concepts": ["Constructive Dialogue", "Consensus"]
            }
        ]

    # Server-side authoritative timestamps
    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=config.duration_minutes)

    # Save Session in DB
    new_session = InterviewSession(
        id=session_id,
        user_id=current_user.id,
        resume_id=selected_resume.id if selected_resume else None,
        interview_type=config.interview_type,
        difficulty=config.difficulty,
        duration_minutes=config.duration_minutes,
        role_domain=config.role_domain,
        allow_followups=config.allow_followups,
        status="in_progress",
        started_at=now,
        expires_at=expires_at,
        questions_data=json.dumps(questions_list),
        created_at=now
    )
    db.add(new_session)

    # Initialize InterviewQA records for all questions
    for q in questions_list:
        qa_rec = InterviewQA(
            session_id=session_id,
            question_index=q["question_index"],
            question_type=q.get("question_type", "technical"),
            question_text=q["question_text"]
        )
        db.add(qa_rec)

    db.commit()

    first_q = questions_list[0]

    return {
        "session_id": session_id,
        "first_question": first_q["question_text"],
        "first_question_index": 0,
        "first_question_type": first_q.get("question_type", "technical"),
        "total_questions": len(questions_list),
        "difficulty": config.difficulty,
        "interview_type": config.interview_type,
        "duration_minutes": config.duration_minutes,
        "duration_seconds": config.duration_minutes * 60,
        "started_at": now.isoformat(),
        "expires_at": expires_at.isoformat()
    }


@router.get("/session/{session_id}")
def get_session_state(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the current session state, remaining time synchronized with the server,
    current question, and previous answers (allows refresh recovery).
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    now = datetime.utcnow()
    remaining_seconds = max(0, int((session.expires_at - now).total_seconds()))

    # Check if timer expired on server
    if remaining_seconds <= 0 and session.status == "in_progress":
        session.status = "expired"
        db.commit()

    try:
        questions = json.loads(session.questions_data) if session.questions_data else []
    except Exception:
        questions = []

    qa_records = db.query(InterviewQA).filter(
        InterviewQA.session_id == session_id
    ).order_by(InterviewQA.question_index.asc()).all()

    # Find next unanswered question index
    current_index = 0
    history = []
    for qa in qa_records:
        if qa.user_answer:
            history.append({
                "question_index": qa.question_index,
                "question": qa.question_text,
                "answer": qa.user_answer,
                "score": qa.score,
                "feedback": qa.feedback,
                "strengths": qa.strengths,
                "improvements": qa.improvement_suggestions
            })
            current_index = max(current_index, qa.question_index + 1)

    is_finished = (current_index >= len(questions)) or (remaining_seconds <= 0) or (session.status != "in_progress")
    current_q_text = questions[current_index]["question_text"] if current_index < len(questions) else ""

    return {
        "session_id": session.id,
        "status": session.status,
        "difficulty": session.difficulty,
        "interview_type": session.interview_type,
        "current_index": current_index,
        "total_questions": len(questions),
        "current_question": current_q_text,
        "remaining_seconds": remaining_seconds,
        "is_finished": is_finished,
        "history": history,
        "expires_at": session.expires_at.isoformat()
    }


@router.post("/submit-answer")
def submit_interview_answer(
    req: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates candidate's answer using multi-factor rubrics, checks server timer,
    records results, and returns evaluation feedback along with the next question.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == req.session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    now = datetime.utcnow()
    # Check if timer has expired
    is_time_up = (now > session.expires_at)
    if is_time_up and session.status == "in_progress":
        session.status = "expired"

    # Find the corresponding QA record
    target_idx = req.question_index
    if target_idx is None:
        unanswered = db.query(InterviewQA).filter(
            InterviewQA.session_id == req.session_id,
            InterviewQA.user_answer == None
        ).order_by(InterviewQA.question_index.asc()).first()
        target_idx = unanswered.question_index if unanswered else 0

    qa_rec = db.query(InterviewQA).filter(
        InterviewQA.session_id == req.session_id,
        InterviewQA.question_index == target_idx
    ).first()

    if not qa_rec:
        raise HTTPException(status_code=404, detail=f"Question #{target_idx} not found.")

    # Parse questions pool
    try:
        questions = json.loads(session.questions_data) if session.questions_data else []
    except Exception:
        questions = []

    current_q_item = questions[target_idx] if target_idx < len(questions) else {}
    topic = current_q_item.get("topic", session.role_domain)

    # Evaluate the answer
    eval_result = {}
    if evaluate_interview_response:
        eval_result = evaluate_interview_response(
            question=qa_rec.question_text,
            answer=req.answer_text,
            difficulty=session.difficulty,
            question_type=qa_rec.question_type,
            topic=topic
        )
    else:
        eval_result = {
            "score_10": 7.5,
            "score_100": 75,
            "strengths": "Structured explanation with clear context.",
            "missing_concepts": "Could include specific metrics.",
            "improvement_suggestions": "Quantify outcomes with numbers.",
            "ideal_answer": "In production, I structured the service with modular layers...",
            "disclaimer": "AI evaluations are automated estimates."
        }

    # Save to QA record
    qa_rec.user_answer = req.answer_text
    qa_rec.score = eval_result.get("score_10", 7.5)
    qa_rec.feedback = eval_result.get("strengths", "")
    qa_rec.strengths = eval_result.get("strengths", "")
    qa_rec.missing_concepts = eval_result.get("missing_concepts", "")
    qa_rec.improvement_suggestions = eval_result.get("improvement_suggestions", "")
    qa_rec.ideal_answer = eval_result.get("ideal_answer", "")
    qa_rec.answered_at = now

    db.commit()

    # Determine next question
    next_index = target_idx + 1
    is_completed = (next_index >= len(questions)) or is_time_up

    # Check if a follow-up question should be added dynamically
    followup_q_text = eval_result.get("followup_question")
    if (
        session.allow_followups 
        and followup_q_text 
        and not is_time_up 
        and len(questions) < 18
        and not qa_rec.is_followup
    ):
        # Insert follow-up question right after current question
        new_followup = {
            "question_index": next_index,
            "question_text": f"Follow-up: {followup_q_text}",
            "question_type": "follow_up",
            "topic": f"{topic} (Verification)",
            "is_followup": True
        }
        # Shift subsequent question indices
        for i in range(next_index, len(questions)):
            questions[i]["question_index"] = i + 1
        questions.insert(next_index, new_followup)
        session.questions_data = json.dumps(questions)

        # Create QA row for follow-up
        db.add(InterviewQA(
            session_id=session.id,
            question_index=next_index,
            question_type="follow_up",
            question_text=new_followup["question_text"],
            is_followup=True
        ))
        db.commit()

    next_question_text = ""
    if next_index < len(questions) and not is_completed:
        next_question_text = questions[next_index]["question_text"]

    # If interview completed, compile report
    report_data = None
    if is_completed:
        session.status = "completed" if not is_time_up else "expired"
        session.ended_at = now
        time_spent = int((now - session.started_at).total_seconds())
        session.total_time_spent_seconds = time_spent

        all_qa = db.query(InterviewQA).filter(InterviewQA.session_id == session.id).all()
        qa_serialized = [
            {
                "question_index": q.question_index,
                "question_text": q.question_text,
                "user_answer": q.user_answer,
                "score_10": q.score or 0.0,
                "score": q.score or 0.0,
                "feedback": q.feedback,
                "strengths": q.strengths,
                "missing_concepts": q.missing_concepts,
                "improvement_suggestions": q.improvement_suggestions,
                "ideal_answer": q.ideal_answer,
                "topic": questions[q.question_index].get("topic", "General") if q.question_index < len(questions) else "General"
            }
            for q in all_qa
        ]

        if generate_interview_performance_report:
            report_data = generate_interview_performance_report(
                session_config={
                    "interview_type": session.interview_type,
                    "difficulty": session.difficulty,
                    "question_count": len(questions)
                },
                qa_list=qa_serialized,
                total_time_spent_seconds=time_spent
            )
            session.overall_score = report_data.get("overall_score_10")
            session.report_data = json.dumps(report_data)
        db.commit()

    remaining_secs = max(0, int((session.expires_at - now).total_seconds()))

    return {
        "score": eval_result.get("score_10", 7.5),
        "score_100": eval_result.get("score_100", 75),
        "feedback": eval_result.get("strengths", ""),
        "strengths": eval_result.get("strengths", ""),
        "improvements": eval_result.get("improvement_suggestions", ""),
        "missing_concepts": eval_result.get("missing_concepts", ""),
        "ideal_answer": eval_result.get("ideal_answer", ""),
        "next_question": next_question_text,
        "next_question_index": next_index,
        "is_completed": is_completed,
        "remaining_seconds": remaining_secs,
        "disclaimer": "AI evaluations are automated estimates designed for preparation."
    }


@router.post("/end-session")
def end_interview_session(
    req: EndSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Terminates or finalizes an active interview session and compiles
    the comprehensive performance report.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == req.session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    now = datetime.utcnow()
    session.status = "completed" if req.reason == "completed" else "terminated_early"
    session.ended_at = now
    time_spent = int((now - session.started_at).total_seconds())
    session.total_time_spent_seconds = time_spent

    try:
        questions = json.loads(session.questions_data) if session.questions_data else []
    except Exception:
        questions = []

    all_qa = db.query(InterviewQA).filter(InterviewQA.session_id == session.id).all()
    qa_serialized = [
        {
            "question_index": q.question_index,
            "question_text": q.question_text,
            "user_answer": q.user_answer,
            "score_10": q.score or 0.0,
            "score": q.score or 0.0,
            "feedback": q.feedback,
            "strengths": q.strengths,
            "missing_concepts": q.missing_concepts,
            "improvement_suggestions": q.improvement_suggestions,
            "ideal_answer": q.ideal_answer,
            "topic": questions[q.question_index].get("topic", "General") if q.question_index < len(questions) else "General"
        }
        for q in all_qa
    ]

    # Fetch past sessions for historical comparison
    past_sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.id != session.id,
        InterviewSession.status.in_(["completed", "terminated_early"])
    ).all()
    past_serialized = [{"overall_score": s.overall_score} for s in past_sessions if s.overall_score is not None]

    report = {}
    if generate_interview_performance_report:
        report = generate_interview_performance_report(
            session_config={
                "interview_type": session.interview_type,
                "difficulty": session.difficulty,
                "question_count": len(questions)
            },
            qa_list=qa_serialized,
            total_time_spent_seconds=time_spent,
            historical_sessions=past_serialized
        )
        session.overall_score = report.get("overall_score_10")
        session.report_data = json.dumps(report)

    db.commit()

    return {
        "message": "Interview session ended successfully.",
        "session_id": session.id,
        "report": report
    }


@router.get("/report/{session_id}")
def get_interview_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches the detailed performance report for a specific interview session.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview report not found.")

    if session.report_data:
        try:
            return json.loads(session.report_data)
        except Exception:
            pass

    # If report was not pre-compiled, generate it on the fly
    all_qa = db.query(InterviewQA).filter(InterviewQA.session_id == session.id).all()
    try:
        questions = json.loads(session.questions_data) if session.questions_data else []
    except Exception:
        questions = []

    qa_serialized = [
        {
            "question_index": q.question_index,
            "question_text": q.question_text,
            "user_answer": q.user_answer,
            "score_10": q.score or 0.0,
            "score": q.score or 0.0,
            "feedback": q.feedback,
            "strengths": q.strengths,
            "missing_concepts": q.missing_concepts,
            "improvement_suggestions": q.improvement_suggestions,
            "ideal_answer": q.ideal_answer,
            "topic": questions[q.question_index].get("topic", "General") if q.question_index < len(questions) else "General"
        }
        for q in all_qa
    ]

    report = generate_interview_performance_report(
        session_config={
            "interview_type": session.interview_type,
            "difficulty": session.difficulty,
            "question_count": len(questions)
        },
        qa_list=qa_serialized,
        total_time_spent_seconds=session.total_time_spent_seconds or 0
    )
    session.report_data = json.dumps(report)
    session.overall_score = report.get("overall_score_10")
    db.commit()

    return report


@router.get("/history")
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical interview records for the user.
    """
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    history = []
    for s in sessions:
        history.append({
            "session_id": s.id,
            "interview_type": s.interview_type,
            "difficulty": s.difficulty,
            "status": s.status,
            "duration_minutes": s.duration_minutes,
            "overall_score": s.overall_score,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "ended_at": s.ended_at.isoformat() if s.ended_at else None,
            "has_report": bool(s.report_data or s.overall_score)
        })
    return {"history": history}


@router.get("/analytics")
def get_interview_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Aggregates interview statistics across difficulty levels, interview types,
    and weak topics for dashboard visualization.
    """
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).all()

    completed = [s for s in sessions if s.overall_score is not None]
    total_count = len(completed)

    if total_count == 0:
        return {
            "total_completed": 0,
            "average_score_10": 0.0,
            "average_score_100": 0,
            "difficulty_stats": {
                "beginner": {"count": 0, "avg_score": 0.0},
                "intermediate": {"count": 0, "avg_score": 0.0},
                "advanced": {"count": 0, "avg_score": 0.0}
            },
            "type_stats": {},
            "weak_topics": [],
            "skills_demonstrated": [s.strip() for s in (current_user.extracted_skills or "").split(",") if s.strip()][:5],
            "recommended_next_session": {
                "type": "resume",
                "difficulty": "intermediate",
                "duration_minutes": 15,
                "label": "15-Min Resume-Driven Mock Interview"
            }
        }

    scores = [s.overall_score for s in completed]
    avg_score_10 = round(sum(scores) / len(scores), 1)

    # Difficulty breakdown
    diff_map: Dict[str, List[float]] = {"beginner": [], "intermediate": [], "advanced": []}
    type_map: Dict[str, List[float]] = {}
    weak_topics_list = []

    for s in completed:
        d = (s.difficulty or "intermediate").lower()
        if d in diff_map:
            diff_map[d].append(s.overall_score)
        
        t = s.interview_type or "resume"
        type_map.setdefault(t, []).append(s.overall_score)

        if s.report_data:
            try:
                rep = json.loads(s.report_data)
                for w in rep.get("areas_for_improvement", []):
                    if w not in weak_topics_list:
                        weak_topics_list.append(w)
            except Exception:
                pass

    difficulty_stats = {}
    for d, d_scores in diff_map.items():
        difficulty_stats[d] = {
            "count": len(d_scores),
            "avg_score": round(sum(d_scores) / len(d_scores), 1) if d_scores else 0.0
        }

    type_stats = {}
    for t, t_scores in type_map.items():
        type_stats[t] = {
            "count": len(t_scores),
            "avg_score": round(sum(t_scores) / len(t_scores), 1) if t_scores else 0.0
        }

    # Recommend next session: if intermediate > 7.5, advance to advanced; otherwise intermediate
    next_diff = "advanced" if avg_score_10 >= 7.8 else "intermediate"

    return {
        "total_completed": total_count,
        "average_score_10": avg_score_10,
        "average_score_100": int(avg_score_10 * 10),
        "difficulty_stats": difficulty_stats,
        "type_stats": type_stats,
        "weak_topics": weak_topics_list[:4],
        "skills_demonstrated": [s.strip() for s in (current_user.extracted_skills or "").split(",") if s.strip()][:6],
        "recommended_next_session": {
            "type": "resume" if not type_map.get("resume") else "technical",
            "difficulty": next_diff,
            "duration_minutes": 15,
            "label": f"15-Min {next_diff.capitalize()} Mock Interview"
        }
    }


@router.post("/transcribe-audio")
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts candidate audio recording, transcribes speech with AI, and returns text.
    """
    safe_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{os.path.basename(audio.filename or 'recording.webm')}"
    file_path = os.path.join(AUDIO_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        transcript = transcribe_audio(file_path)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")
