from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), default="pdf")
    extracted_skills = Column(Text, nullable=True)
    parsed_data = Column(Text, nullable=True)  # JSON text with projects, internships, experience, education, etc.
    is_primary = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    sessions = relationship("InterviewSession", back_populates="resume")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    
    interview_type = Column(String(50), default="resume")  # resume, technical, hr, project, coding, mixed
    difficulty = Column(String(20), default="intermediate")  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, default=15)
    role_domain = Column(String(100), default="Software Engineering")
    allow_followups = Column(Boolean, default=True)
    
    status = Column(String(30), default="in_progress")  # in_progress, completed, terminated_early, expired
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    total_time_spent_seconds = Column(Integer, default=0)
    
    overall_score = Column(Float, nullable=True)
    questions_data = Column(Text, nullable=True)  # JSON list of all generated questions and current index
    report_data = Column(Text, nullable=True)     # JSON structured performance report
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    resume = relationship("Resume", back_populates="sessions")
    qa_records = relationship("InterviewQA", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQA.question_index")


class InterviewQA(Base):
    __tablename__ = "interview_qa"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_index = Column(Integer, default=0)
    question_type = Column(String(50), default="technical")  # project, internship, skill, technical, hr, follow_up
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    
    score = Column(Float, nullable=True)  # Normalized 0-10 or 0-100
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    missing_concepts = Column(Text, nullable=True)
    improvement_suggestions = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    is_followup = Column(Boolean, default=False)
    answered_at = Column(DateTime, nullable=True)

    # Relationships
    session = relationship("InterviewSession", back_populates="qa_records")
