import os
import json
import re
from typing import List, Dict, Any, Optional
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

def _clean_percentage(val, default: int = 80) -> int:
    if val is None:
        return default
    try:
        cleaned = str(val).replace("%", "").replace(",", "").strip()
        num = int(float(cleaned))
        return max(40, min(99, num))
    except Exception:
        return default

def generate_career_pathway_report(
    skills: list = None,
    resume_data: dict = None,
    candidate_name: str = "Candidate",
    resume_filename: str = None
) -> dict:
    """
    Generates a comprehensive, resume-driven Career Pathway & Skill Synergy Report
    analyzing candidate skills, projects, internships, and work experience.
    Returns complete intelligence for UI display and executive PDF dossier export.
    """
    resume_data = resume_data or {}
    skills = skills or []

    # Merge skills from resume_data if available
    extracted_skills = list(resume_data.get("skills", []))
    all_skills = list(dict.fromkeys([str(s).strip() for s in (skills + extracted_skills) if str(s).strip()]))
    
    cand_name = resume_data.get("candidate_name") or candidate_name or "Technical Candidate"
    if cand_name == "Candidate" and resume_data.get("summary"):
        # Check if candidate name is in summary or fallback
        cand_name = "Engineering Candidate"

    projects = resume_data.get("projects", [])
    internships = resume_data.get("internships", [])
    work_exp = resume_data.get("work_experience", [])
    education = resume_data.get("education", [])
    certifications = resume_data.get("certifications", [])

    # If Gemini is available, generate dynamic personalized report
    if get_gemini_api_key() and all_skills:
        try:
            projects_summary = ""
            for p in projects[:3]:
                title = p.get("title", "Project")
                techs = ", ".join(p.get("technologies", []))
                desc = p.get("description", "")
                projects_summary += f"- {title} (Tech: {techs}): {desc}\n"

            exp_summary = ""
            for exp in (work_exp + internships)[:3]:
                comp = exp.get("company", "Tech Company")
                role = exp.get("role", "Engineer")
                dur = exp.get("duration", "")
                exp_summary += f"- {role} at {comp} ({dur})\n"

            prompt = f"""
            Act as an elite engineering career strategist, tech talent partner, and compensation analyst for the Indian tech market.
            Analyze this candidate's verified resume profile to construct a comprehensive Career Pathway & Skill Synergy Report.

            CANDIDATE PROFILE:
            - Name: {cand_name}
            - Verified Skills: {', '.join(all_skills[:20])}
            - Featured Projects:
            {projects_summary or "None specified"}
            - Experience & Internships:
            {exp_summary or "Early Career / Student Projects"}
            - Certifications: {', '.join(certifications) if certifications else "Self-taught / Degree"}

            TASK:
            Generate a detailed Career Pathway and Skill Synergy Report formatted strictly as valid JSON.
            All compensation MUST be in Indian Rupees (INR) and Lakhs Per Annum (LPA), e.g. "₹22,00,000 - ₹34,00,000 / yr (22 - 34 LPA)".

            Output Schema:
            {{
              "candidate_name": "{cand_name}",
              "readiness_score": <integer 75 to 97 reflecting market readiness>,
              "target_median_salary": "<e.g. ₹24,00,000 (24 LPA)>",
              "executive_summary": "<3 sentences synthesizing candidate's technical identity, biggest architectural/coding strengths, and market leverage in India>",
              "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
              "action_plan_30_60_90": {{
                "days_30": "<Month 1 milestone: bridge top priority skill gap and build proof>",
                "days_60": "<Month 2 milestone: advanced system design, mock interviews and portfolio>",
                "days_90": "<Month 3 milestone: target company tier-1 applications, referral outreach, and compensation negotiation>"
              }},
              "matches": [
                {{
                  "title": "<Specific Role Title, e.g. Senior Full-Stack & AI Systems Engineer>",
                  "match_percentage": <integer 75 to 98>,
                  "demand": "<Very High | High | Moderate>",
                  "avg_salary": "<e.g. ₹22,00,000 - ₹32,00,000 / yr (22 - 32 LPA)>",
                  "growth": "<e.g. +28% YoY>",
                  "description": "<2 sentences explaining why candidate's projects and skills qualify them for this role>",
                  "matched_skills": ["<skill 1 from candidate skills>", "<skill 2>"],
                  "skill_gaps": ["<skill 1 to acquire>", "<skill 2 to acquire>"],
                  "responsibilities": [
                    "<Core day to day engineering responsibility 1>",
                    "<Core day to day engineering responsibility 2>",
                    "<Core day to day engineering responsibility 3>"
                  ],
                  "tailored_advice": "<Specific 1-2 sentence recommendation for succeeding in this role>"
                }}
              ]
            }}
            Provide 3 to 4 distinct, realistic tech career pathways. Return ONLY valid JSON.
            """

            raw_resp = call_gemini_api(prompt, temperature=0.2)
            if raw_resp:
                cleaned = clean_json_response(raw_resp)
                report_data = json.loads(cleaned)
                if isinstance(report_data, dict) and report_data.get("matches"):
                    # Validate and sanitize matches
                    matches = []
                    for m in report_data.get("matches", []):
                        if isinstance(m, dict) and m.get("title"):
                            matches.append({
                                "title": str(m.get("title")),
                                "match_percentage": _clean_percentage(m.get("match_percentage"), 88),
                                "demand": str(m.get("demand", "High")),
                                "avg_salary": str(m.get("avg_salary", "₹22,00,000 - ₹32,00,000 (22 - 32 LPA)")),
                                "growth": str(m.get("growth", "+24% YoY")),
                                "description": str(m.get("description", "Architects and scales high-performance systems.")),
                                "matched_skills": [str(s) for s in m.get("matched_skills", all_skills[:4])],
                                "skill_gaps": [str(s) for s in m.get("skill_gaps", ["Distributed Systems", "Cloud Deployments"])],
                                "responsibilities": [str(r) for r in m.get("responsibilities", ["Build production services.", "Maintain code quality.", "Optimize scalability."])],
                                "tailored_advice": str(m.get("tailored_advice", "Leverage your core project experience to lead system design conversations."))
                            })
                    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
                    
                    return {
                        "candidate_name": str(report_data.get("candidate_name", cand_name)),
                        "resume_filename": resume_filename,
                        "readiness_score": _clean_percentage(report_data.get("readiness_score"), 88),
                        "target_median_salary": str(report_data.get("target_median_salary", "₹24,00,000 (24 LPA)")),
                        "executive_summary": str(report_data.get("executive_summary", f"Demonstrates strong hands-on capabilities across modern software engineering stacks with active projects in {', '.join(all_skills[:3])}. Well-positioned for competitive engineering offers.")),
                        "top_strengths": [str(s) for s in report_data.get("top_strengths", ["Full-Stack Problem Solving", "Modern API Development", "Component Architecture"])],
                        "action_plan_30_60_90": report_data.get("action_plan_30_60_90", {
                            "days_30": "Acquire top identified skill gap and deploy a live working proof on GitHub.",
                            "days_60": "Master distributed systems and practice behavioral/STAR technical interviews.",
                            "days_90": "Target tier-1 product startups and negotiate competitive top-tier CTC compensation."
                        }),
                        "matches": matches
                    }
        except Exception as e:
            print(f"Gemini career report generation error: {e}")

    # Fallback deterministic intelligence engine
    return _build_fallback_career_report(all_skills, resume_data, cand_name, resume_filename)

def _build_fallback_career_report(all_skills: list, resume_data: dict, cand_name: str, resume_filename: str) -> dict:
    skills_lower = [s.lower() for s in all_skills]
    
    has_python = any('python' in s for s in skills_lower)
    has_react = any('react' in s or 'frontend' in s or 'javascript' in s or 'typescript' in s for s in skills_lower)
    has_ml = any('machine learning' in s or 'ml' in s or 'ai' in s or 'pytorch' in s or 'data' in s for s in skills_lower)
    has_cloud = any('docker' in s or 'kubernetes' in s or 'aws' in s or 'gcp' in s or 'cloud' in s or 'devops' in s for s in skills_lower)
    has_backend = any('fastapi' in s or 'django' in s or 'flask' in s or 'node' in s or 'sql' in s or 'postgres' in s for s in skills_lower)

    matches = []

    # Pathway 1: Full-Stack & AI Systems
    fs_matched = [s for s in all_skills if any(k in s.lower() for k in ['react', 'python', 'fastapi', 'javascript', 'docker', 'sql', 'postgres', 'rest'])]
    fs_gaps = [g for g in ['Kubernetes', 'Redis Caching', 'Vector Databases', 'LangChain'] if not any(g.lower() in s.lower() for s in all_skills)]
    matches.append({
        "title": "Senior Full-Stack & AI Systems Engineer",
        "match_percentage": 94 if (has_react and has_python) else (88 if has_react or has_python else 78),
        "demand": "Very High",
        "avg_salary": "₹22,00,000 - ₹32,00,000 / yr (22 - 32 LPA)",
        "growth": "+28% YoY",
        "description": "Architects end-to-end full-stack applications with high-throughput asynchronous backends and reactive modern user interfaces.",
        "matched_skills": fs_matched[:6] or ["Python", "React", "REST APIs"],
        "skill_gaps": fs_gaps[:3] or ["System Design", "Redis Caching"],
        "responsibilities": [
            "Architect high-availability RESTful and asynchronous microservices.",
            "Design responsive, accessible component-driven frontend interfaces.",
            "Implement containerized deployments and automated CI/CD canary rollouts."
        ],
        "tailored_advice": "Highlight your full-stack project architecture and database indexing in technical interviews."
    })

    # Pathway 2: AI / ML Solutions
    ml_matched = [s for s in all_skills if any(k in s.lower() for k in ['python', 'ml', 'machine learning', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'sql'])]
    ml_gaps = [g for g in ['PyTorch / TensorFlow', 'MLOps', 'Vector Search', 'Model Serving'] if not any(g.lower() in s.lower() for s in all_skills)]
    matches.append({
        "title": "AI & Machine Learning Solutions Engineer",
        "match_percentage": 92 if has_ml else 84,
        "demand": "High",
        "avg_salary": "₹24,00,000 - ₹36,00,000 / yr (24 - 36 LPA)",
        "growth": "+34% YoY",
        "description": "Develops intelligent inference pipelines, RAG systems, and data-driven predictive architectures for production workloads.",
        "matched_skills": ml_matched[:6] or ["Python", "FastAPI", "SQL"],
        "skill_gaps": ml_gaps[:3] or ["Distributed Inference", "MLflow"],
        "responsibilities": [
            "Build robust data extraction and vector retrieval-augmented pipelines.",
            "Benchmark model inference latency, token efficiency, and throughput.",
            "Deploy and monitor containerized machine learning microservices."
        ],
        "tailored_advice": "Prepare to discuss token efficiency, chunking strategies, and precision metrics during technical rounds."
    })

    # Pathway 3: Cloud & Backend Systems
    backend_matched = [s for s in all_skills if any(k in s.lower() for k in ['python', 'docker', 'sql', 'linux', 'git', 'postgres', 'fastapi'])]
    backend_gaps = [g for g in ['Kafka Streaming', 'Distributed Tracing', 'Terraform', 'Prometheus'] if not any(g.lower() in s.lower() for s in all_skills)]
    matches.append({
        "title": "Backend Systems & Cloud Platform Engineer",
        "match_percentage": 90 if (has_backend or has_cloud) else 82,
        "demand": "High",
        "avg_salary": "₹20,00,000 - ₹30,00,000 / yr (20 - 30 LPA)",
        "growth": "+22% YoY",
        "description": "Specializes in scalable backend services, asynchronous queues, database clustering, and resilient cloud infrastructure.",
        "matched_skills": backend_matched[:6] or ["Python", "Docker", "PostgreSQL"],
        "skill_gaps": backend_gaps[:3] or ["Kafka", "Distributed Systems"],
        "responsibilities": [
            "Implement high-throughput transaction pipelines and message brokering.",
            "Optimize complex relational and key-value database queries.",
            "Ensure 99.99% service availability with robust observability."
        ],
        "tailored_advice": "Practice explaining database isolation levels and asynchronous event processing."
    })

    # Pathway 4: Technical Product Engineer
    pm_matched = [s for s in all_skills if any(k in s.lower() for k in ['git', 'agile', 'python', 'api', 'architecture'])]
    pm_gaps = [g for g in ['Product Roadmapping', 'User Analytics', 'A/B Testing'] if not any(g.lower() in s.lower() for s in all_skills)]
    matches.append({
        "title": "Technical Product & Solutions Specialist",
        "match_percentage": 78,
        "demand": "Moderate",
        "avg_salary": "₹18,00,000 - ₹26,00,000 / yr (18 - 26 LPA)",
        "growth": "+18% YoY",
        "description": "Bridges customer business needs and technical engineering execution to deliver impactful AI-powered software solutions.",
        "matched_skills": pm_matched[:4] or ["API Design", "System Architecture"],
        "skill_gaps": pm_gaps[:3] or ["Product Analytics", "Roadmapping"],
        "responsibilities": [
            "Translate business and client requirements into precise technical specifications.",
            "Collaborate across design, backend engineering, and client stakeholders.",
            "Drive sprint planning and technical milestones."
        ],
        "tailored_advice": "Highlight your end-to-end project ownership and communication clarity."
    })

    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    top_role = matches[0]["title"]

    return {
        "candidate_name": cand_name,
        "resume_filename": resume_filename,
        "readiness_score": 88 if len(all_skills) >= 5 else 80,
        "target_median_salary": "₹24,00,000 (24 LPA)",
        "executive_summary": f"Strong engineering foundation with verified competencies in {', '.join(all_skills[:4])}. Demonstrates verified project execution and high alignment with {top_role} requisitions in the Indian technology market.",
        "top_strengths": [
            f"Hands-on expertise in {all_skills[0]}" if all_skills else "Full-Stack Development",
            f"Proficient with {all_skills[1]}" if len(all_skills) > 1 else "Modern API Systems",
            "Demonstrated real-world project development",
            "Clean architecture and modular coding patterns"
        ],
        "action_plan_30_60_90": {
            "days_30": f"Close the '{matches[0]['skill_gaps'][0]}' knowledge gap with a hands-on proof-of-concept project.",
            "days_60": "Master system design principles, load balancing, and practice structured STAR interviews.",
            "days_90": "Engage directly with tier-1 Indian tech product companies and negotiate top-bracket CTC offers."
        },
        "matches": matches
    }

def predict_career_matches(skills: list = None, resume_data: dict = None) -> list:
    """
    Predicts career matches based on skills and resume data.
    Returns list of matched roles for complete backward compatibility.
    """
    report = generate_career_pathway_report(skills=skills, resume_data=resume_data)
    return report.get("matches", [])

def fallback_predict_career_matches(skills: list) -> list:
    """
    Deterministic fallback for unit tests and offline environments.
    """
    has_python = any('python' in s.lower() for s in (skills or []))
    has_react = any('react' in s.lower() for s in (skills or []))
    
    matches = []
    if has_python:
        matches.append({"title": "Data Scientist", "match_percentage": 92, "description": "Analyzes complex data to extract insights using Python."})
        matches.append({"title": "Backend Engineer", "match_percentage": 88, "description": "Develops server-side logic and APIs."})
    if has_react:
        matches.append({"title": "Frontend Developer", "match_percentage": 95, "description": "Builds user interfaces using React."})
        matches.append({"title": "Full Stack Developer", "match_percentage": 82, "description": "Handles both frontend and backend development."})
        
    if not matches:
        matches = [
            {"title": "Software Engineer", "match_percentage": 75, "description": "Develops and maintains software systems."},
            {"title": "IT Support Specialist", "match_percentage": 60, "description": "Provides technical assistance and support."}
        ]
        
    return sorted(matches, key=lambda x: x['match_percentage'], reverse=True)
