def generate_course_embeddings(courses):
    """
    Mock function to generate embeddings for a list of courses.
    """
    embeddings = {}
    for course in courses:
        # Mock embedding generation
        embeddings[course] = [0.1, 0.2, 0.3, 0.4]
    return embeddings

if __name__ == "__main__":
    courses = ["React Basics", "Advanced Python", "Machine Learning 101"]
    print(generate_course_embeddings(courses))
