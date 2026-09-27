def generate_job_embeddings(jobs: list):
    """
    Mock function to generate embeddings for a list of job postings.
    """
    embeddings = {}
    for job in jobs:
        embeddings[job] = [0.5, 0.5, 0.5, 0.5]
    return embeddings

if __name__ == "__main__":
    jobs = ["Software Engineer", "Data Scientist", "Product Manager"]
    print(generate_job_embeddings(jobs))
