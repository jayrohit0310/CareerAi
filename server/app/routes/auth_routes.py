from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.base import get_db
from app.models.user import User
from app.middleware.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from config.settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    extracted_skills: Optional[str] = None
    predicted_role: Optional[str] = None

class SkillsUpdate(BaseModel):
    skills: List[str]

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/skills")
def update_skills(data: SkillsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clean_skills = [s.strip() for s in data.skills if s.strip()]
    current_user.extracted_skills = ",".join(clean_skills)
    db.commit()
    db.refresh(current_user)
    return {"message": "Skills updated successfully", "skills": clean_skills}

