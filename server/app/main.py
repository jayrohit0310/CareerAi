from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_routes, 
    resume_routes, 
    career_routes, 
    chatbot_routes, 
    course_routes, 
    interview_routes, 
    job_routes, 
    salary_routes,
    feedback_routes
)
from app.models.base import Base, engine
import app.models.user
import app.models.interview

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerCraft AI API",
    description="Enterprise-grade career acceleration and talent intelligence API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(resume_routes.router)
app.include_router(career_routes.router)
app.include_router(chatbot_routes.router)
app.include_router(course_routes.router)
app.include_router(interview_routes.router)
app.include_router(job_routes.router)
app.include_router(salary_routes.router)
app.include_router(feedback_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CareerCraft AI API", "status": "online"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerCraft AI Backend",
        "version": "1.0.0"
    }
