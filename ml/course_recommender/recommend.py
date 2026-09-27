def recommend_courses(skills: list) -> list:
    """
    Mock function to recommend courses based on skills.
    """
    recommendations = []
    if 'python' in [s.lower() for s in skills]:
        recommendations.append({"title": "Advanced Python Programming", "provider": "Coursera"})
    if 'react' in [s.lower() for s in skills]:
        recommendations.append({"title": "React Native for Beginners", "provider": "Udemy"})
        
    if not recommendations:
        recommendations.append({"title": "Introduction to Computer Science", "provider": "edX"})
        
    return recommendations
