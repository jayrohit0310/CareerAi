def find_skill_gaps(current_skills: list, target_role_skills: list) -> list:
    """
    Identify skills missing from the user's current skillset compared to the target role.
    """
    current_set = set([s.lower() for s in current_skills])
    target_set = set([s.lower() for s in target_role_skills])
    
    gaps = target_set - current_set
    return list(gaps)
