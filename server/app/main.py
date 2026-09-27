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

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerCraft AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
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
    return {"message": "Welcome to CareerCraft AI API"}
