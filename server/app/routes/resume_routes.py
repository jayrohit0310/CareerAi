import os
import sys

# Add the root directory to path so we can import from ml folder
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(ROOT_DIR)

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.middleware.auth import get_current_user

try:
    from ml.resume_parser.extract_text import extract_text_from_pdf
    from ml.resume_parser.skill_extractor import extract_skills
except ImportError:
    # Fallback in case of import issues
    extract_text_from_pdf = None
    extract_skills = None

router = APIRouter(prefix="/resume", tags=["resume"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    skills = []
    if extract_text_from_pdf and extract_skills:
        try:
            # Extract text from the saved PDF
            text = extract_text_from_pdf(file_path)
            # Extract skills from the text
            skills = extract_skills(text)
            
            # Save to user model
            current_user.extracted_skills = ",".join(skills)
            db.commit()
            db.refresh(current_user)
        except Exception as e:
            print(f"Error during extraction: {e}")
            raise HTTPException(status_code=500, detail="Failed to process resume")
    else:
        print("ML modules not found, skipping extraction")
        
    return {
        "message": "Resume uploaded successfully", 
        "filename": file.filename,
        "skills": skills
    }
