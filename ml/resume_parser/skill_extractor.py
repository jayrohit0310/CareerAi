import re
import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

# A basic dictionary of common tech and soft skills for v1
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

def extract_skills(text: str) -> list[str]:
    """
    Extracts skills from a given text using Gemini LLM for better semantic understanding.
    Falls back to regex matching if API is not available.
    """
    if not text:
        return []

    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here":
        return fallback_extract_skills(text)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Extract professional skills (e.g. programming languages, frameworks, tools, soft skills) from the following text.
        Return ONLY a JSON list of strings, for example: ["Python", "Machine Learning", "Communication"]
        
        Text:
        {text}
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        result = json.loads(text_resp)
        if isinstance(result, list):
            return result
        return fallback_extract_skills(text)
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return fallback_extract_skills(text)

def fallback_extract_skills(text: str) -> list[str]:
    extracted = set()
    # Normalize text to lower case for case-insensitive matching
    text_lower = text.lower()
    
    for skill in COMMON_SKILLS:
        # Use regex to match the skill as a whole word (avoid matching "java" in "javascript")
        # Escape the skill string to handle cases like "Node.js" or "C++"
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            extracted.add(skill)
            
    return list(extracted)
