import json
import random
from typing import Dict, Any, List, Optional
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

DEFAULT_ESTIMATED_QUESTIONS = {
    5: 3,
    10: 5,
    15: 7,
    30: 10,
    45: 14
}

def generate_interview_question_sequence(
    interview_type: str = "resume",
    difficulty: str = "intermediate",
    duration_minutes: int = 15,
    role_domain: str = "Software Engineering",
    parsed_resume: Optional[Dict[str, Any]] = None,
    allow_followups: bool = True
) -> List[Dict[str, Any]]:
    """
    Generates a personalized, structured sequence of interview questions grounded
    strictly in the candidate's resume (if available) or target domain, adjusted for
    difficulty and duration.
    """
    target_count = DEFAULT_ESTIMATED_QUESTIONS.get(duration_minutes, 6)
    
    # Try generating with Gemini first
    if get_gemini_api_key():
        try:
            questions = _generate_with_gemini(
                interview_type=interview_type,
                difficulty=difficulty,
                target_count=target_count,
                role_domain=role_domain,
                parsed_resume=parsed_resume
            )
            if questions and len(questions) >= target_count:
                return questions[:target_count]
            elif questions and len(questions) > 0:
                # Top up with fallback if LLM gave fewer than needed
                fallback = _generate_fallback_questions(
                    interview_type, difficulty, target_count, role_domain, parsed_resume
                )
                for q in fallback:
                    if len(questions) >= target_count:
                        break
                    if not any(item["question_text"] == q["question_text"] for item in questions):
                        questions.append(q)
                return questions
        except Exception as e:
            print(f"Error in Gemini question generation: {e}")

    # Deterministic high-quality fallback generator
    return _generate_fallback_questions(
        interview_type=interview_type,
        difficulty=difficulty,
        target_count=target_count,
        role_domain=role_domain,
        parsed_resume=parsed_resume
    )


def _generate_with_gemini(
    interview_type: str,
    difficulty: str,
    target_count: int,
    role_domain: str,
    parsed_resume: Optional[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    resume_context = ""
    has_resume = False
    if parsed_resume and isinstance(parsed_resume, dict):
        skills = parsed_resume.get("skills", [])
        projects = parsed_resume.get("projects", [])
        internships = parsed_resume.get("internships", [])
        work_exp = parsed_resume.get("work_experience", [])
        claims = parsed_resume.get("key_claims", [])

        if skills or projects or internships:
            has_resume = True
            resume_context = f"""
CANDIDATE RESUME INFORMATION:
- Extracted Skills: {', '.join(skills[:15])}
- Projects Mentioned: {json.dumps(projects[:3])}
- Internships Mentioned: {json.dumps(internships[:2])}
- Work Experience: {json.dumps(work_exp[:2])}
- Key Metrics/Claims: {json.dumps(claims[:3])}
"""

    prompt = f"""
You are a Principal Engineering Hiring Manager at a top-tier tech company.
Generate exactly {target_count} structured interview questions for a candidate.

CONFIGURATION:
- Interview Type: {interview_type.upper()} (resume, technical, hr, project, coding, mixed)
- Difficulty Level: {difficulty.upper()} (Beginner, Intermediate, Advanced)
- Target Role/Domain: {role_domain}
- Has Uploaded Resume: {has_resume}

{resume_context if has_resume else "NO RESUME: Generate domain-based questions for " + role_domain}

DIFFICULTY GUIDELINES:
- BEGINNER: Focus on fundamental concepts, straightforward project implementation details, basic syntax, and guided problem-solving.
- INTERMEDIATE: Focus on architectural decisions, trade-offs, debugging scenarios, performance bottlenecks, and practical real-world production challenges.
- ADVANCED: Focus on high-level system design, deep concurrency/scaling bottlenecks, trade-offs between distributed algorithms, failure recovery, and rigorous verification of resume claims.

STRICT ACCURACY RULES:
- If a resume is provided, NEVER hallucinate an internship, project, or skill that is NOT explicitly mentioned above.
- Reference their exact project titles and tools when asking project-based questions.
- If there are no internships in the resume, DO NOT ask internship questions; ask project or technical questions instead.

Output MUST be ONLY valid JSON matching this schema:
[
  {{
    "question_text": "Full question text clearly phrased for the candidate",
    "question_type": "project | internship | skill | technical | behavioral | coding",
    "topic": "Architecture / React / Distributed Systems / etc",
    "ideal_concepts": ["concept 1 that a great answer must cover", "concept 2"]
  }}
]
"""
    raw_resp = call_gemini_api(prompt, temperature=0.3, max_tokens=1600)
    if not raw_resp:
        return []
    
    clean_text = clean_json_response(raw_resp)
    items = json.loads(clean_text)
    if not isinstance(items, list):
        return []
    
    valid_questions = []
    for idx, item in enumerate(items):
        if isinstance(item, dict) and item.get("question_text"):
            valid_questions.append({
                "question_index": idx,
                "question_text": str(item["question_text"]).strip(),
                "question_type": str(item.get("question_type", "technical")),
                "topic": str(item.get("topic", role_domain)),
                "ideal_concepts": item.get("ideal_concepts", [])
            })
    return valid_questions


def _generate_fallback_questions(
    interview_type: str,
    difficulty: str,
    target_count: int,
    role_domain: str,
    parsed_resume: Optional[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    questions = []
    
    projects = []
    internships = []
    skills = []
    if parsed_resume and isinstance(parsed_resume, dict):
        projects = parsed_resume.get("projects", [])
        internships = parsed_resume.get("internships", [])
        skills = parsed_resume.get("skills", [])

    # 1. Project-based questions (if resume has projects and type is resume, project, or mixed)
    if projects and interview_type in ["resume", "project", "mixed"]:
        proj = projects[0]
        proj_title = proj.get("title", "your technical project")
        proj_techs = ", ".join(proj.get("technologies", [])[:3]) or "the chosen tech stack"

        if difficulty == "beginner":
            questions.append({
                "question_text": f"In your project '{proj_title}', could you walk me through what the application does and why you chose {proj_techs} to build it?",
                "question_type": "project",
                "topic": "Project Fundamentals",
                "ideal_concepts": ["Project Purpose", "Basic Tech Choices", "Individual Contribution"]
            })
            questions.append({
                "question_text": f"What was your personal role and responsibility while developing '{proj_title}', and what was the most interesting feature you personally implemented?",
                "question_type": "project",
                "topic": "Project Contribution",
                "ideal_concepts": ["Features Implemented", "Individual Ownership", "Testing"]
            })
        elif difficulty == "intermediate":
            questions.append({
                "question_text": f"Can you explain the high-level architecture of '{proj_title}'? Specifically, how do the client, server, and data storage layers communicate with each other?",
                "question_type": "project",
                "topic": "Architecture Design",
                "ideal_concepts": ["Layered Architecture", "API Design", "Data Flow", "Error Handling"]
            })
            questions.append({
                "question_text": f"What was the most challenging technical roadblock or bug you encountered while engineering '{proj_title}', and how did you debug and resolve it?",
                "question_type": "project",
                "topic": "Problem Solving & Debugging",
                "ideal_concepts": ["Root Cause Analysis", "Debugging Methodology", "Resolution Impact"]
            })
        else: # advanced
            questions.append({
                "question_text": f"Looking at '{proj_title}', if you were to redesign it for 100x traffic volume, what are the primary architectural bottlenecks you would face, and how would you optimize data caching, indexing, or concurrency?",
                "question_type": "project",
                "topic": "System Scalability & Optimization",
                "ideal_concepts": ["Scalability Bottlenecks", "Caching Strategy", "Concurrency Controls", "Performance Benchmarks"]
            })
            questions.append({
                "question_text": f"In '{proj_title}', what were the explicit technical trade-offs you made when selecting {proj_techs} instead of alternatives? What would you do differently in retrospect?",
                "question_type": "project",
                "topic": "Technical Trade-offs",
                "ideal_concepts": ["Architectural Trade-offs", "Alternative Evaluation", "Technical Debt", "Refactoring Strategy"]
            })

    # 2. Internship-based questions (ONLY if resume has internships)
    if internships and interview_type in ["resume", "project", "mixed"]:
        intern = internships[0]
        company = intern.get("company", "your internship organization")
        role = intern.get("role", "Software Intern")
        intern_techs = ", ".join(intern.get("technologies", [])[:3]) or "the technologies you used"

        if difficulty == "beginner":
            questions.append({
                "question_text": f"During your internship at {company} as a {role}, what were your primary responsibilities, and how did you collaborate with senior engineers?",
                "question_type": "internship",
                "topic": "Internship Experience",
                "ideal_concepts": ["Daily Workflow", "Team Collaboration", "Tasks Completed"]
            })
        elif difficulty == "intermediate":
            questions.append({
                "question_text": f"At {company}, can you detail a specific feature or technical task you owned end-to-end? How did you ensure your code met the team's production standards?",
                "question_type": "internship",
                "topic": "Production Execution",
                "ideal_concepts": ["Code Quality", "CI/CD / Reviews", "Business Context", "Delivery"]
            })
        else:
            questions.append({
                "question_text": f"During your time at {company}, describe a situation where you had to navigate ambiguous requirements or an unexpected technical failure in production. How did you assess trade-offs and drive consensus?",
                "question_type": "internship",
                "topic": "Ambiguity & Production Impact",
                "ideal_concepts": ["Root Cause Analysis", "Stakeholder Communication", "Resilience", "Measurable Outcome"]
            })

    # 3. Skills-based questions (grounded in actual extracted skills)
    if skills and interview_type in ["resume", "technical", "mixed"]:
        primary_skill = skills[0]
        secondary_skill = skills[1] if len(skills) > 1 else "REST APIs"

        if difficulty == "beginner":
            questions.append({
                "question_text": f"You've listed {primary_skill} on your profile. How does it handle data flow or state management, and what are the best practices for writing clean code with it?",
                "question_type": "skill",
                "topic": f"{primary_skill} Fundamentals",
                "ideal_concepts": ["State Management", "Code Organization", "Standard Patterns"]
            })
        elif difficulty == "intermediate":
            questions.append({
                "question_text": f"In production systems using {primary_skill} and {secondary_skill}, what strategies do you use for error handling, asynchronous operations, and performance tuning?",
                "question_type": "skill",
                "topic": f"{primary_skill} & {secondary_skill} Deep Dive",
                "ideal_concepts": ["Async Handling", "Error Propagation", "Performance Optimization"]
            })
        else:
            questions.append({
                "question_text": f"How does the internal runtime or memory model of {primary_skill} work under heavy loads? How do you diagnose and prevent memory leaks or blocking I/O?",
                "question_type": "skill",
                "topic": f"{primary_skill} Internals & Systems",
                "ideal_concepts": ["Memory Management", "Non-blocking I/O", "Garbage Collection / Profiling", "Thread Safety"]
            })

    # 4. Domain / Technical questions
    if len(questions) < target_count and interview_type in ["technical", "mixed", "coding", "resume"]:
        if difficulty == "beginner":
            questions.extend([
                {
                    "question_text": "Explain the difference between SQL and NoSQL databases. In what scenario would you choose a relational database over a document store?",
                    "question_type": "technical",
                    "topic": "Databases & Storage",
                    "ideal_concepts": ["Schema vs Schemaless", "ACID vs BASE", "Indexing"]
                },
                {
                    "question_text": "What happens under the hood from the moment a user types a URL into their browser until the webpage finishes rendering?",
                    "question_type": "technical",
                    "topic": "Web Networking",
                    "ideal_concepts": ["DNS Lookup", "TCP Handshake", "HTTP/HTTPS", "DOM Tree Construction"]
                }
            ])
        elif difficulty == "intermediate":
            questions.extend([
                {
                    "question_text": "How do you ensure data consistency and prevent race conditions when multiple concurrent users attempt to update the same database record simultaneously?",
                    "question_type": "technical",
                    "topic": "Database Concurrency",
                    "ideal_concepts": ["Optimistic vs Pessimistic Locking", "Database Transactions", "Isolation Levels"]
                },
                {
                    "question_text": "Describe how you would design an idempotent RESTful API endpoint for processing financial transactions or order checkouts.",
                    "question_type": "technical",
                    "topic": "API Design & Idempotency",
                    "ideal_concepts": ["Idempotency Keys", "HTTP Verbs", "Retry Semantics", "Distributed Locks"]
                }
            ])
        else:
            questions.extend([
                {
                    "question_text": "How would you design a distributed rate limiter that handles 500,000 requests per second across multiple regional data centers while keeping latency under 5ms?",
                    "question_type": "technical",
                    "topic": "Distributed System Design",
                    "ideal_concepts": ["Token Bucket / Sliding Window", "Redis Cluster / Memory Locality", "Network Partitions", "Eventual Consistency"]
                },
                {
                    "question_text": "Explain CAP theorem trade-offs in modern distributed storage engines. How does partition tolerance impact read/write consistency during network splits?",
                    "question_type": "technical",
                    "topic": "Distributed Consensus",
                    "ideal_concepts": ["CAP Theorem", "Quorum Reads/Writes", "PACELC", "Split-Brain Resolution"]
                }
            ])

    # 5. HR / Behavioral questions (for HR or mixed interviews)
    if len(questions) < target_count and interview_type in ["hr", "mixed"]:
        if difficulty == "beginner":
            questions.append({
                "question_text": "Tell me about a time when you received critical feedback on your code or work. How did you react and what changes did you make?",
                "question_type": "behavioral",
                "topic": "Feedback & Growth",
                "ideal_concepts": ["Receptiveness", "Constructive Action", "Growth Mindset"]
            })
        elif difficulty == "intermediate":
            questions.append({
                "question_text": "Describe a scenario where you and a colleague strongly disagreed on a technical architectural direction. How did you advocate for your point of view while maintaining team alignment?",
                "question_type": "behavioral",
                "topic": "Conflict Resolution",
                "ideal_concepts": ["Objective Evaluation", "Data-Driven Consensus", "Disagree and Commit"]
            })
        else:
            questions.append({
                "question_text": "Can you share an experience where a critical production system experienced an outage under your watch? Walk me through how you led triage, communicated with stakeholders, and formulated the blameless post-mortem.",
                "question_type": "behavioral",
                "topic": "Crisis Leadership",
                "ideal_concepts": ["Calm Prioritization", "Incident Mitigation", "Blameless Post-Mortem", "Long-Term Prevention"]
            })

    # Ensure we return clean indexed questions
    trimmed = questions[:target_count]
    for i, q in enumerate(trimmed):
        q["question_index"] = i
    return trimmed


def generate_followup_question(
    current_question: str,
    candidate_answer: str,
    difficulty: str = "intermediate"
) -> Optional[str]:
    """
    Generates a contextual follow-up question when candidate answer lacks depth,
    is vague, or introduces an interesting technical claim worth exploring.
    """
    if not candidate_answer or len(candidate_answer.strip().split()) < 5:
        return "Could you elaborate in greater detail on the specific technical decisions and measurable results of your approach?"

    if get_gemini_api_key():
        try:
            prompt = f"""
You are a senior technical interviewer.
Question asked: {current_question}
Candidate answer: {candidate_answer}
Difficulty: {difficulty}

Determine if a deeper follow-up question is warranted to verify their understanding, challenge a vague point, or probe technical trade-offs.
If so, provide ONE concise, insightful follow-up question.
If the answer was already exhaustive, return null.

Return ONLY valid JSON:
{{"has_followup": true, "followup_question": "Your question here"}}
"""
            raw_resp = call_gemini_api(prompt, temperature=0.3, max_tokens=300)
            if raw_resp:
                cleaned = clean_json_response(raw_resp)
                res = json.loads(cleaned)
                if res.get("has_followup") and res.get("followup_question"):
                    return str(res["followup_question"]).strip()
        except Exception:
            pass

    # Deterministic follow-up heuristic
    words = candidate_answer.lower()
    if "database" in words or "sql" in words or "mongo" in words:
        return "How did you handle database indexing and query optimization as the data volume grew?"
    elif "api" in words or "fastapi" in words or "express" in words:
        return "How did you design authentication, error handling, and latency safeguards for those endpoints?"
    elif "test" in words or "testing" in words:
        return "What was your automated testing strategy (unit vs integration vs e2e), and how did you prevent regressions?"
    else:
        return "What were the primary trade-offs you considered with that approach, and what would you improve if rebuilding it today?"
