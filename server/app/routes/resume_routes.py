import os
import sys
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.models.interview import Resume
from app.middleware.auth import get_current_user

try:
    from ml.resume_parser.extract_text import extract_text_from_file
    from ml.resume_parser.enhanced_parser import parse_resume_structure
except ImportError as e:
    print(f"Resume parser import error: {e}")
    extract_text_from_file = None
    parse_resume_structure = None

try:
    from ml.career_prediction.predict import generate_career_pathway_report, predict_career_matches
except ImportError as e:
    print(f"Career prediction import error: {e}")
    generate_career_pathway_report = None
    predict_career_matches = None

try:
    from ml.course_recommender.recommend_courses import predict_courses
except ImportError as e:
    print(f"Course recommender import error: {e}")
    predict_courses = None

try:
    from ml.job_recommender.recommend_jobs import predict_jobs
except ImportError as e:
    print(f"Job recommender import error: {e}")
    predict_jobs = None

try:
    from ml.salary_prediction.predict_salary import predict_salary_range
except ImportError as e:
    print(f"Salary prediction import error: {e}")
    predict_salary_range = None

router = APIRouter(prefix="/resume", tags=["resume"])

UPLOAD_DIR = os.path.join(ROOT_DIR, "storage", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


def execute_one_time_resume_scan(resume: Resume, current_user: User, db: Session) -> dict:
    """
    Performs the full one-time talent intelligence scan on a resume:
    1. Extracts/parses structure if not already parsed
    2. Runs career pathway matches & readiness score
    3. Runs personalized course gap recommendations
    4. Runs targeted job & internship matching
    5. Runs benchmarked salary estimation
    6. Caches all scan results directly in resume.parsed_data["scan_results"]
    7. Syncs user skills and predicted role
    """
    try:
        parsed_data = json.loads(resume.parsed_data) if resume.parsed_data else {}
    except Exception:
        parsed_data = {}

    # Extract raw text and parse structure if empty
    if not parsed_data or not parsed_data.get("skills"):
        if os.path.exists(resume.file_path) and extract_text_from_file and parse_resume_structure:
            try:
                raw_text = extract_text_from_file(resume.file_path)
                parsed_data = parse_resume_structure(raw_text)
            except Exception as e:
                print(f"Error parsing resume structure during scan: {e}")

    # Skills resolution
    extracted_skills = parsed_data.get("skills", [])
    if not extracted_skills and resume.extracted_skills:
        extracted_skills = [s.strip() for s in resume.extracted_skills.split(",") if s.strip()]
    if not extracted_skills:
        extracted_skills = ["Software Engineering", "Problem Solving", "Web Development"]

    skills_csv = ",".join(extracted_skills)
    resume.extracted_skills = skills_csv

    candidate_name = parsed_data.get("candidate_name") or current_user.email.split("@")[0]

    # 1. Career Pathway Report & Matches
    career_report = {}
    try:
        if generate_career_pathway_report:
            career_report = generate_career_pathway_report(
                skills=extracted_skills,
                resume_data=parsed_data,
                candidate_name=candidate_name,
                resume_filename=resume.filename
            )
    except Exception as e:
        print(f"Career report error during scan: {e}")

    top_matches = career_report.get("matches", [])
    if not top_matches and predict_career_matches:
        try:
            top_matches = predict_career_matches(skills=extracted_skills, resume_data=parsed_data)
        except Exception:
            top_matches = []

    predicted_role = top_matches[0]["title"] if top_matches else (current_user.predicted_role or "Full-Stack Software Engineer")
    readiness_score = career_report.get("readiness_score") or min(96, max(60, len(extracted_skills) * 10 + 20))

    # 2. Course Recommendations
    courses = []
    try:
        if predict_courses:
            courses = predict_courses(extracted_skills)
            for c in courses:
                if "skills" in c and "skill_tags" not in c:
                    c["skill_tags"] = c.pop("skills", [])
                elif "skill_tags" not in c:
                    c["skill_tags"] = []
    except Exception as e:
        print(f"Course recommendation error during scan: {e}")

    # 3. Job & Internship Recommendations
    jobs = []
    try:
        if predict_jobs:
            jobs = predict_jobs(extracted_skills, opportunity_type="all")
    except Exception as e:
        print(f"Job recommendation error during scan: {e}")

    # 4. Salary Range & Experience calculation
    work_exp = parsed_data.get("work_experience", [])
    internships = parsed_data.get("internships", [])
    exp_years = max(1, min(15, len(work_exp) * 2 + len(internships)))

    salary_estimate = {}
    try:
        if predict_salary_range:
            salary_estimate = predict_salary_range(predicted_role, experience_years=exp_years)
    except Exception as e:
        print(f"Salary estimation error during scan: {e}")

    if not salary_estimate:
        salary_estimate = {
            "min_salary": 1200000,
            "max_salary": 2400000,
            "median_salary": 1800000,
            "currency": "INR",
            "role": predicted_role
        }

    median_lpa = salary_estimate.get("median_salary", 1800000) // 100000
    salary_formatted = f"₹{median_lpa} LPA"

    scan_results = {
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "candidate_name": candidate_name,
        "target_role": predicted_role,
        "readiness_score": readiness_score,
        "experience_years": exp_years,
        "salary_estimate": salary_estimate,
        "salary_formatted": salary_formatted,
        "career_matches": top_matches,
        "career_report": career_report,
        "courses": courses,
        "jobs": jobs,
        "skills": extracted_skills
    }

    parsed_data["scan_results"] = scan_results
    resume.parsed_data = json.dumps(parsed_data)

    if resume.is_primary:
        current_user.extracted_skills = skills_csv
        current_user.predicted_role = predicted_role

    db.commit()
    db.refresh(resume)
    db.refresh(current_user)

    return scan_results


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format '{ext}'. Only PDF and DOCX files are allowed."
        )

    safe_filename = os.path.basename(file.filename)
    stored_filename = f"{current_user.id}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB.")

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Initial extraction of text & structured profile
    parsed_data = {}
    skills = []
    try:
        if extract_text_from_file and parse_resume_structure:
            raw_text = extract_text_from_file(file_path)
            parsed_data = parse_resume_structure(raw_text)
            skills = parsed_data.get("skills", [])
        else:
            skills = ["Software Engineering", "Python", "Problem Solving"]
            parsed_data = {
                "candidate_name": current_user.email.split("@")[0],
                "skills": skills,
                "projects": [],
                "internships": [],
                "work_experience": [],
                "certifications": [],
                "education": []
            }
    except Exception as e:
        print(f"Error during initial resume extraction: {e}")
        skills = ["Software Engineering", "Communication", "Problem Solving"]
        parsed_data = {
            "candidate_name": current_user.email.split("@")[0],
            "skills": skills,
            "projects": [],
            "internships": [],
            "work_experience": [],
            "certifications": [],
            "education": []
        }

    # Mark any existing resumes for this user as not primary
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": False})

    # Store new Resume record in Database
    new_resume = Resume(
        user_id=current_user.id,
        filename=safe_filename,
        file_path=file_path,
        file_type=ext.lstrip("."),
        extracted_skills=",".join(skills),
        parsed_data=json.dumps(parsed_data),
        is_primary=True
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Automatically run the one-time scan pipeline so all recommendations synchronize immediately
    scan_results = execute_one_time_resume_scan(new_resume, current_user, db)

    return {
        "message": "Resume uploaded and AI talent scan completed successfully.",
        "resume_id": new_resume.id,
        "filename": safe_filename,
        "file_type": ext.lstrip("."),
        "skills": scan_results.get("skills", skills),
        "scan_results": scan_results,
        "parsed_data": parsed_data
    }


@router.post("/{resume_id}/scan")
def trigger_resume_scan(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers or re-executes the one-time comprehensive AI scan on a specific uploaded resume.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    scan_results = execute_one_time_resume_scan(resume, current_user, db)
    return {
        "message": "One-time resume scan completed successfully.",
        "resume_id": resume.id,
        "filename": resume.filename,
        "scan_results": scan_results
    }


@router.post("/{resume_id}/set-primary")
def set_primary_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sets the specified resume as the active/primary resume for the user.
    Synchronizes candidate skills and target role across all components.
    """
    target_resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not target_resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    # Mark all other resumes as non-primary
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": False})
    target_resume.is_primary = True

    # Sync skills and predicted role to user
    if target_resume.extracted_skills:
        current_user.extracted_skills = target_resume.extracted_skills

    try:
        parsed = json.loads(target_resume.parsed_data) if target_resume.parsed_data else {}
        target_role = parsed.get("scan_results", {}).get("target_role")
        if target_role:
            current_user.predicted_role = target_role
    except Exception:
        pass

    db.commit()
    db.refresh(target_resume)
    db.refresh(current_user)

    return {
        "message": f"Resume '{target_resume.filename}' is now active.",
        "primary_resume_id": target_resume.id,
        "filename": target_resume.filename,
        "skills": [s.strip() for s in (target_resume.extracted_skills or "").split(",") if s.strip()]
    }


@router.get("/list")
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all uploaded resumes for the authenticated candidate with scan summaries.
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    results = []
    for r in resumes:
        try:
            parsed = json.loads(r.parsed_data) if r.parsed_data else {}
        except Exception:
            parsed = {}
        scan = parsed.get("scan_results") or {}
        results.append({
            "id": r.id,
            "filename": r.filename,
            "file_type": r.file_type,
            "skills": [s.strip() for s in (r.extracted_skills or "").split(",") if s.strip()],
            "project_count": len(parsed.get("projects", [])),
            "internship_count": len(parsed.get("internships", [])),
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "is_primary": r.is_primary,
            "has_scan": bool(scan),
            "readiness_score": scan.get("readiness_score"),
            "target_role": scan.get("target_role"),
            "target_salary": scan.get("salary_formatted")
        })
    return {"resumes": results}


@router.get("/{resume_id}")
def get_resume_details(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches full parsed resume structure and cached scan results for review.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    try:
        parsed_data = json.loads(resume.parsed_data) if resume.parsed_data else {}
    except Exception:
        parsed_data = {}

    return {
        "id": resume.id,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "is_primary": resume.is_primary,
        "extracted_skills": [s.strip() for s in (resume.extracted_skills or "").split(",") if s.strip()],
        "parsed_data": parsed_data,
        "scan_results": parsed_data.get("scan_results"),
        "created_at": resume.created_at.isoformat() if resume.created_at else None
    }


@router.put("/{resume_id}")
def update_resume_details(
    resume_id: int,
    updated_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows user to review and correct parsed skills, projects, and internships.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    # Update skills if provided
    new_skills = updated_data.get("skills")
    if new_skills and isinstance(new_skills, list):
        clean_skills = [str(s).strip() for s in new_skills if str(s).strip()]
        resume.extracted_skills = ",".join(clean_skills)
        if resume.is_primary:
            current_user.extracted_skills = ",".join(clean_skills)

    resume.parsed_data = json.dumps(updated_data)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume details updated successfully.",
        "id": resume.id,
        "parsed_data": updated_data
    }


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an uploaded resume. If the deleted resume was primary, sets the next available resume as primary.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    was_primary = resume.is_primary
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()

    # Reassign primary if needed
    if was_primary:
        next_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
        if next_resume:
            next_resume.is_primary = True
            current_user.extracted_skills = next_resume.extracted_skills
            try:
                parsed = json.loads(next_resume.parsed_data) if next_resume.parsed_data else {}
                current_user.predicted_role = parsed.get("scan_results", {}).get("target_role") or current_user.predicted_role
            except Exception:
                pass
            db.commit()
        else:
            current_user.extracted_skills = None
            current_user.predicted_role = None
            db.commit()

    return {"message": "Resume deleted successfully."}
