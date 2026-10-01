import os
import csv
import json
import math
import ssl
import urllib.request
from typing import List, Dict, Any, Optional

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two numeric vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def tfidf_similarity(text_a: str, text_b: str) -> float:
    """Token-based TF-IDF overlap similarity for fast fallback ranking."""
    tokens_a = set(text_a.lower().replace(",", " ").replace(".", " ").split())
    tokens_b = set(text_b.lower().replace(",", " ").replace(".", " ").split())
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = tokens_a.intersection(tokens_b)
    union = tokens_a.union(tokens_b)
    return len(intersection) / len(union)

class VectorStore:
    """
    Semantic Vector Store for CareerCraft AI.
    Supports Google Gemini Embedding 001 with cached embeddings and keyword-similarity fallback.
    """
    def __init__(self):
        self.documents: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.embeddings: List[Optional[List[float]]] = []
        self._initialized = False

    def get_api_key(self) -> str:
        key = os.environ.get("GEMINI_API_KEY", "")
        if not key or key == "your_gemini_api_key_here":
            # Attempt to read from .env in project root
            try:
                root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
                if os.path.exists(root_env):
                    for line in open(root_env, encoding="utf-8"):
                        line = line.strip()
                        if line.startswith("GEMINI_API_KEY="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val and val != "your_gemini_api_key_here":
                                return val
            except Exception:
                pass
        return key

    def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generates 3072-dimensional embedding using gemini-embedding-001."""
        api_key = self.get_api_key()
        if not api_key or api_key == "your_gemini_api_key_here":
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
        payload = json.dumps({"content": {"parts": [{"text": text[:1500]}]}}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "CareerAi/1.0"}
        )
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("embedding", {}).get("values")
        except Exception as e:
            # Fallback gracefully
            return None

    def add_document(self, text: str, metadata: Optional[Dict[str, Any]] = None, compute_embedding: bool = False):
        self.documents.append(text)
        self.metadatas.append(metadata or {})
        if compute_embedding:
            emb = self.get_embedding(text)
            self.embeddings.append(emb)
        else:
            self.embeddings.append(None)

    def initialize_knowledge_base(self):
        """Pre-populates the vector store with verified career advice, rubrics, and catalog data."""
        if self._initialized:
            return

        core_knowledge = [
            {
                "topic": "STAR Interview Method",
                "text": (
                    "The STAR method is the premier framework for behavioral and technical interviews. "
                    "Situation: Set the context, project scope, team size, and business challenge. "
                    "Task: Define your specific responsibility and core technical objective. "
                    "Action: Detail the exact decisions you made, algorithms chosen, architectural trade-offs, and technologies deployed. "
                    "Result: Highlight measurable business impact, such as 40% latency reduction, 99.9% uptime, or $200k cost savings."
                ),
                "category": "interviews"
            },
            {
                "topic": "Technical Coding & System Design Interviews",
                "text": (
                    "To excel in technical interviews: 1) Clarify edge cases and constraints (latency, throughput, data volume). "
                    "2) Propose a baseline high-level design before deep diving into component architecture. "
                    "3) Discuss trade-offs: SQL vs NoSQL, synchronous REST vs asynchronous message queues (Kafka, RabbitMQ), caching layers (Redis), and database indexing. "
                    "4) Address failure modes: graceful degradation, circuit breakers, and rate limiting."
                ),
                "category": "interviews"
            },
            {
                "topic": "ATS Resume Optimization",
                "text": (
                    "To pass Applicant Tracking Systems (ATS) and impress hiring managers: "
                    "1) Use standard headers: Summary, Technical Skills, Experience, Education, Projects. "
                    "2) Format experience bullets with the Google X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'. "
                    "3) Include exact relevant keywords (e.g., Python, React, Docker, Kubernetes, AWS, REST API) matching target job descriptions. "
                    "4) Avoid multi-column layouts, graphics, or tables that confuse ATS parsers."
                ),
                "category": "resume"
            },
            {
                "topic": "Salary Negotiation & Total Compensation",
                "text": (
                    "Salary negotiation rules: "
                    "1) Never disclose current salary or state a concrete number first; ask for the role's budget range. "
                    "2) Benchmark compensation using percentile data (market median for your tier and geography). "
                    "3) Evaluate total compensation (Base Salary + Annual Bonus + Equity/RSUs + 401k match). "
                    "4) When countering an initial offer, present quantifiable value and market data politely with a target 10-15% increase."
                ),
                "category": "compensation"
            },
            {
                "topic": "Frontend to Full Stack Transition Roadmap",
                "text": (
                    "Transitioning from Frontend to Full Stack requires mastering: "
                    "1) Server-side programming: Python (FastAPI/Django) or Node.js (Express/Nest.js). "
                    "2) Relational databases (PostgreSQL) and schema design, ORMs, indexing, and ACID transactions. "
                    "3) API design: RESTful best practices, JWT authentication, and GraphQL. "
                    "4) Containerization with Docker and deploying cloud workloads on AWS, GCP, or Render."
                ),
                "category": "career_roadmap"
            },
            {
                "topic": "Data Science & AI Engineer Career Roadmap",
                "text": (
                    "Key skills for Data Science and Machine Learning Engineers: "
                    "1) Foundations: Python, NumPy, Pandas, linear algebra, and statistics. "
                    "2) Classical ML: Scikit-learn (regression, classification, clustering, evaluation metrics). "
                    "3) Deep Learning & LLMs: PyTorch, Hugging Face transformers, fine-tuning, LangChain, RAG architecture, and Vector Databases (ChromaDB, Pinecone). "
                    "4) MLOps: Model tracking (MLflow), containerized API deployment, and inference optimization."
                ),
                "category": "career_roadmap"
            }
        ]

        for item in core_knowledge:
            self.add_document(item["text"], metadata={"topic": item["topic"], "category": item["category"]})

        # Load courses dataset if available
        courses_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/courses.csv"))
        if os.path.exists(courses_path):
            try:
                with open(courses_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        doc = f"Course: {row.get('title')} on {row.get('provider')}. Skills covered: {row.get('skills')}."
                        self.add_document(doc, metadata={"type": "course", "title": row.get("title"), "skills": row.get("skills")})
            except Exception as e:
                print(f"Error loading courses into vector store: {e}")

        # Load job postings dataset if available
        jobs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/job_postings.csv"))
        if os.path.exists(jobs_path):
            try:
                with open(jobs_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        doc = f"Job Opening: {row.get('title')} at {row.get('company')} ({row.get('location')}). Required skills: {row.get('skills')}."
                        self.add_document(doc, metadata={"type": "job", "title": row.get("title"), "company": row.get("company")})
            except Exception as e:
                print(f"Error loading jobs into vector store: {e}")

        # Load salary dataset if available
        salary_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/salary_dataset.csv"))
        if os.path.exists(salary_path):
            try:
                with open(salary_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        doc = f"Salary Benchmark: {row.get('role')} with {row.get('experience_years')} years experience in {row.get('location')} averages ${row.get('salary')} USD."
                        self.add_document(doc, metadata={"type": "salary", "role": row.get("role"), "salary": row.get("salary")})
            except Exception as e:
                print(f"Error loading salaries into vector store: {e}")

        self._initialized = True

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves the top_k most relevant documents for the query using
        neural embedding cosine similarity, falling back to lexical TF-IDF matching.
        """
        if not self._initialized:
            self.initialize_knowledge_base()

        if not self.documents:
            return []

        query_emb = self.get_embedding(query)

        scored_results = []
        for idx, doc in enumerate(self.documents):
            score = 0.0
            doc_emb = self.embeddings[idx]

            # If neural embeddings are available for both query and doc
            if query_emb is not None:
                if doc_emb is None:
                    # Compute and cache on demand
                    doc_emb = self.get_embedding(doc)
                    self.embeddings[idx] = doc_emb

                if doc_emb is not None:
                    score = cosine_similarity(query_emb, doc_emb)

            # If neural embedding score is zero or embeddings failed, use TF-IDF lexical overlap
            if score == 0.0:
                score = tfidf_similarity(query, doc)

            scored_results.append({
                "document": doc,
                "metadata": self.metadatas[idx],
                "score": round(score, 4)
            })

        # Sort descending by relevance score
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]

# Global singleton
store = VectorStore()
