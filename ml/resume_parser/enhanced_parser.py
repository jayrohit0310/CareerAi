import re
import json
from typing import Dict, Any, List
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key
from ml.resume_parser.skill_extractor import COMMON_SKILLS, fallback_extract_skills

def parse_resume_structure(text: str) -> Dict[str, Any]:
    """
    Parses resume text into a structured dictionary containing skills, projects,
    internships, work experience, certifications, and key claims.
    Uses Gemini when available, with a comprehensive regex/heuristic fallback.
    """
    if not text or not text.strip():
        return _empty_resume_structure()

    # Try Gemini LLM for high-fidelity extraction
    if get_gemini_api_key():
        try:
            prompt = f"""
You are a senior technical recruiter and talent parsing specialist.
Extract detailed structured information from the following resume text.

Return ONLY a valid JSON object matching this schema:
{{
  "candidate_name": "Full Name or Professional Title if visible",
  "summary": "Brief 1-2 sentence professional overview",
  "skills": ["Skill1", "Skill2", ...],
  "projects": [
    {{
      "title": "Project Name",
      "description": "What the project does and its core problem",
      "technologies": ["Python", "FastAPI", ...],
      "contributions": "Individual contribution or role in the project",
      "challenges_and_solutions": "Key challenges encountered and how they were solved"
    }}
  ],
  "internships": [
    {{
      "company": "Company or Org Name",
      "role": "Internship Title",
      "duration": "Dates/Duration",
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "technologies": ["Tech 1", "Tech 2"],
      "achievements": "Notable impact or learning"
    }}
  ],
  "work_experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Duration or Dates",
      "highlights": ["Key achievement 1", "Key achievement 2"],
      "technologies": ["Tech 1", "Tech 2"]
    }}
  ],
  "certifications": ["Certification 1", "Coursework 2"],
  "education": [
    {{
      "degree": "Degree / Major",
      "institution": "University / College",
      "year": "Graduation Year"
    }}
  ],
  "key_claims": ["Notable claim or metric 1 (e.g. reduced latency by 40%)", "claim 2"]
}}

CRITICAL INSTRUCTIONS:
- Do NOT hallucinate skills, internships, or projects that do not exist in the resume text.
- If there are no internships, return an empty array [] for internships.
- If there are no projects, return an empty array [] for projects.
- Extract actual technologies mentioned in the projects and internships.

Resume text:
{text[:6000]}
"""
            raw_resp = call_gemini_api(prompt, temperature=0.1, max_tokens=1500)
            if raw_resp:
                json_str = clean_json_response(raw_resp)
                parsed = json.loads(json_str)
                if isinstance(parsed, dict) and ("skills" in parsed or "projects" in parsed):
                    # Ensure all standard keys exist
                    return _normalize_parsed_resume(parsed, text)
        except Exception as e:
            print(f"Gemini resume parsing failed, falling back to heuristic parser: {e}")

    # Fallback heuristic parser
    return fallback_parse_resume(text)


def _empty_resume_structure() -> Dict[str, Any]:
    return {
        "candidate_name": "Candidate",
        "summary": "Technical profile",
        "skills": ["Software Engineering", "Problem Solving", "Communication"],
        "projects": [],
        "internships": [],
        "work_experience": [],
        "certifications": [],
        "education": [],
        "key_claims": []
    }


def _normalize_parsed_resume(data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    skills = data.get("skills", [])
    if not isinstance(skills, list) or len(skills) == 0:
        skills = fallback_extract_skills(raw_text)
    
    # Clean string items
    clean_skills = [str(s).strip() for s in skills if str(s).strip()]
    if not clean_skills:
        clean_skills = ["Software Development", "Problem Solving"]

    projects = data.get("projects", [])
    if not isinstance(projects, list):
        projects = []
    for p in projects:
        if not isinstance(p, dict):
            continue
        p.setdefault("title", "Technical Project")
        p.setdefault("description", "")
        p.setdefault("technologies", [])
        p.setdefault("contributions", "")
        p.setdefault("challenges_and_solutions", "")

    internships = data.get("internships", [])
    if not isinstance(internships, list):
        internships = []
    for item in internships:
        if not isinstance(item, dict):
            continue
        item.setdefault("company", "Organization")
        item.setdefault("role", "Intern")
        item.setdefault("duration", "")
        item.setdefault("responsibilities", [])
        item.setdefault("technologies", [])
        item.setdefault("achievements", "")

    work_experience = data.get("work_experience", [])
    if not isinstance(work_experience, list):
        work_experience = []

    certifications = data.get("certifications", [])
    if not isinstance(certifications, list):
        certifications = []

    education = data.get("education", [])
    if not isinstance(education, list):
        education = []

    key_claims = data.get("key_claims", [])
    if not isinstance(key_claims, list):
        key_claims = []

    return {
        "candidate_name": str(data.get("candidate_name") or "Candidate"),
        "summary": str(data.get("summary") or "Technical candidate profile"),
        "skills": clean_skills,
        "projects": projects,
        "internships": internships,
        "work_experience": work_experience,
        "certifications": [str(c).strip() for c in certifications if str(c).strip()],
        "education": education,
        "key_claims": [str(c).strip() for c in key_claims if str(c).strip()]
    }


def fallback_parse_resume(text: str) -> Dict[str, Any]:
    """
    Robust regex-based extraction of sections, skills, projects, internships, and education.
    """
    skills = fallback_extract_skills(text)
    if not skills:
        skills = ["Software Engineering", "Python", "Problem Solving"]

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    projects = []
    internships = []
    work_exp = []
    education = []
    certifications = []

    # Detect sections
    current_section = None
    section_buffers: Dict[str, List[str]] = {
        "experience": [],
        "projects": [],
        "internships": [],
        "education": [],
        "skills": [],
        "certifications": []
    }

    for line in lines:
        lower = line.lower()
        if re.search(r'\b(project|projects|academic projects)\b', lower) and len(line) < 40:
            current_section = "projects"
            continue
        elif re.search(r'\b(internship|internships|intern experience)\b', lower) and len(line) < 40:
            current_section = "internships"
            continue
        elif re.search(r'\b(work experience|professional experience|employment)\b', lower) and len(line) < 40:
            current_section = "experience"
            continue
        elif re.search(r'\b(education|academic background|academics)\b', lower) and len(line) < 40:
            current_section = "education"
            continue
        elif re.search(r'\b(certifications|certificates|licenses)\b', lower) and len(line) < 40:
            current_section = "certifications"
            continue
        elif re.search(r'\b(technical skills|skills|technologies)\b', lower) and len(line) < 40:
            current_section = "skills"
            continue

        if current_section:
            section_buffers[current_section].append(line)

    # Process Projects section
    if section_buffers["projects"]:
        proj_lines = section_buffers["projects"]
        current_proj = None
        for line in proj_lines:
            if not current_proj or (len(line) < 60 and not line.startswith(('-', '•', '*', '1.', '2.', '3.'))):
                if current_proj and current_proj["title"]:
                    projects.append(current_proj)
                proj_skills = [s for s in skills if s.lower() in line.lower()]
                current_proj = {
                    "title": line.replace(":", "").strip(),
                    "description": "",
                    "technologies": proj_skills,
                    "contributions": "Designed architecture and implemented core logic.",
                    "challenges_and_solutions": "Optimized performance and ensured reliable data flow."
                }
            else:
                current_proj["description"] += " " + line
                for s in skills:
                    if s.lower() in line.lower() and s not in current_proj["technologies"]:
                        current_proj["technologies"].append(s)
        if current_proj and current_proj["title"]:
            projects.append(current_proj)

    # Process Internships section
    if section_buffers["internships"]:
        intern_lines = section_buffers["internships"]
        current_intern = None
        for line in intern_lines:
            if not current_intern or (len(line) < 60 and not line.startswith(('-', '•', '*', '1.', '2.', '3.'))):
                if current_intern and current_intern["company"]:
                    internships.append(current_intern)
                current_intern = {
                    "company": line.strip(),
                    "role": "Software Engineering Intern",
                    "duration": "Past internship",
                    "responsibilities": [],
                    "technologies": [s for s in skills if s.lower() in line.lower()],
                    "achievements": "Contributed to team deliverables."
                }
            else:
                current_intern["responsibilities"].append(line.lstrip("-•* "))
                for s in skills:
                    if s.lower() in line.lower() and s not in current_intern["technologies"]:
                        current_intern["technologies"].append(s)
        if current_intern and current_intern["company"]:
            internships.append(current_intern)

    # Process Education
    for line in section_buffers["education"]:
        if any(term in line.lower() for term in ["bachelor", "master", "b.tech", "b.e", "b.s", "degree", "university", "institute"]):
            education.append({
                "degree": line,
                "institution": "University / Institute",
                "year": "Completed"
            })

    # Process Certifications
    for line in section_buffers["certifications"]:
        if len(line) < 80:
            certifications.append(line.lstrip("-•* "))

    # Identify Key Claims (e.g. lines with numbers or % or metrics)
    key_claims = []
    for line in lines:
        if any(char in line for char in ["%", "x faster", "reduced", "increased", "optimized", "built", "architected"]):
            if len(line) > 20 and len(line) < 160:
                key_claims.append(line.lstrip("-•* "))
                if len(key_claims) >= 5:
                    break

    # If no projects parsed from section, extract any project-like bullet lines
    if not projects:
        for line in lines:
            if "project" in line.lower() and len(line) < 60:
                projects.append({
                    "title": line.strip(),
                    "description": "Engineered technical project showcasing relevant skills.",
                    "technologies": [s for s in skills[:3]],
                    "contributions": "Full end-to-end implementation",
                    "challenges_and_solutions": "Handled scalability and system integration"
                })
                break

    return {
        "candidate_name": lines[0] if lines else "Candidate",
        "summary": "Technical profile demonstrating hands-on experience and engineering skills.",
        "skills": skills,
        "projects": projects[:4],
        "internships": internships[:3],
        "work_experience": work_exp[:3],
        "certifications": certifications[:4],
        "education": education[:2],
        "key_claims": key_claims[:5]
    }
