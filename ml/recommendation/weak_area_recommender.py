def recommend_for_weak_areas(weaknesses: list) -> list:
    """
    Recommend resources for identified weak areas.
    """
    recommendations = []
    for weakness in weaknesses:
        recommendations.append({
            "topic": weakness,
            "suggestion": f"Focus on improving {weakness} by practicing related algorithms or taking an online course."
        })
    return recommendations
