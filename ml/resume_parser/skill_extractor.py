import re
import os
import json
from ml.common.gemini_client import call_gemini_api, clean_json_response, get_gemini_api_key

COMMON_SKILLS = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust", "HTML", "CSS", "SQL",
    # Frameworks & Libraries
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring Boot", "Next.js", "Tailwind CSS", "Bootstrap",
    "jQuery", "FastAPI", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Elasticsearch",
    # DevOps & Cloud
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Google Cloud", "Jenkins", "GitHub Actions", "GitLab CI", "Terraform", "Ansible",
    "Linux", "Unix", "Bash",
    # Tools & Platforms
    "Git", "GitHub", "Bitbucket", "Jira", "Trello", "Confluence", "Figma", "Postman",
    # Soft Skills & Concepts
    "Agile", "Scrum", "Machine Learning", "Data Science", "Artificial Intelligence", "Deep Learning", "NLP", "REST API", "GraphQL",
    "Microservices", "CI/CD", "Test Driven Development", "Object Oriented Programming"
]

def extract_skills(text: str) -> list:
    """
    Extracts professional skills from resume text using Gemini, with regex fallback.
    """
    if not text:
        return []

    if get_gemini_api_key():
        try:
            prompt = f"""
            Extract a list of professional skills (programming languages, frameworks, cloud tools, databases, and methodologies) from the following resume text.
            Return ONLY a valid JSON array of strings, for example: ["Python", "React", "PostgreSQL", "Docker"]
            No other text.

            Resume text:
            {text[:4000]}
            """
            raw_resp = call_gemini_api(prompt, temperature=0.1)
            if raw_resp:
                json_text = clean_json_response(raw_resp)
                result = json.loads(json_text)
                if isinstance(result, list) and len(result) > 0:
                    return [str(s).strip() for s in result if s]
        except Exception as e:
            print(f"Gemini skill extraction error: {e}")

    return fallback_extract_skills(text)

def fallback_extract_skills(text: str) -> list:
    extracted = set()
    text_lower = text.lower()
    
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            extracted.add(skill)
            
    return list(extracted)
