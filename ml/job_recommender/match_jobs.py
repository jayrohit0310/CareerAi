def match_jobs_to_skills(skills: list) -> list:
    """
    Mock function to match jobs based on user skills.
    """
    matches = []
    if 'python' in [s.lower() for s in skills]:
        matches.append({"title": "Python Developer", "company": "Tech Corp", "match_score": 90})
    if 'react' in [s.lower() for s in skills]:
        matches.append({"title": "Frontend Engineer", "company": "Web Solutions", "match_score": 85})
        
    if not matches:
        matches.append({"title": "Software Engineer", "company": "General Tech", "match_score": 70})
        
    return matches
