import unittest
import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.resume_parser.skill_extractor import extract_skills, fallback_extract_skills
from ml.career_prediction.predict import predict_career_matches, fallback_predict_career_matches
from ml.salary_prediction.predict_salary import _clean_salary, predict_salary_range, fallback_salary
from ml.scoring.score import _clean_score, score_interview_answer, fallback_score
from ml.question_generator.generate_questions import generate_questions
from ml.skill_gap_analysis.gap_finder import find_skill_gaps
from ml.recommendation.weak_area_recommender import recommend_for_weak_areas
from ml.course_recommender.recommend_courses import predict_courses, fallback_predict_courses
from ml.job_recommender.recommend_jobs import predict_jobs, fallback_predict_jobs
from ml.chatbot.vector_store import cosine_similarity, tfidf_similarity, VectorStore
from ml.scoring.confidence_analyzer import analyze_confidence
from ml.scoring.rubric import get_rubric

class TestMLPipelines(unittest.TestCase):
    def test_skill_extraction(self):
        text = "Senior software engineer with 5 years experience in Python, FastAPI, Docker, and PostgreSQL."
        skills = fallback_extract_skills(text)
        self.assertIn("Python", skills)
        self.assertIn("FastAPI", skills)
        self.assertIn("Docker", skills)
        self.assertIn("PostgreSQL", skills)
        self.assertNotIn("Cobol", skills)

    def test_empty_skill_extraction(self):
        self.assertEqual(extract_skills(""), [])
        self.assertEqual(fallback_extract_skills(""), [])

    def test_career_prediction_fallback(self):
        matches = fallback_predict_career_matches(["python", "pandas"])
        self.assertTrue(any("Data Scientist" in m["title"] or "Backend" in m["title"] for m in matches))
        self.assertGreaterEqual(matches[0]["match_percentage"], 60)

    def test_salary_cleaner(self):
        self.assertEqual(_clean_salary("$120,000", 90000), 120000)
        self.assertEqual(_clean_salary("135000.50", 90000), 135000)
        self.assertEqual(_clean_salary("invalid", 90000), 90000)
        self.assertEqual(_clean_salary(None, 80000), 80000)

    def test_salary_prediction_range(self):
        result = fallback_salary("Software Engineer", experience_years=3)
        self.assertIn("min_salary", result)
        self.assertIn("max_salary", result)
        self.assertIn("median_salary", result)
        self.assertLessEqual(result["min_salary"], result["median_salary"])
        self.assertLessEqual(result["median_salary"], result["max_salary"])

    def test_score_cleaner(self):
        self.assertEqual(_clean_score("88/100"), 88)
        self.assertEqual(_clean_score("95%"), 95)
        self.assertEqual(_clean_score(92), 92)
        self.assertEqual(_clean_score("invalid", default=70), 70)
        self.assertEqual(_clean_score("150"), 100) # bounded to 100
        self.assertEqual(_clean_score("-20"), 0)   # bounded to 0

    def test_interview_scoring_fallback(self):
        brief_res = fallback_score("I did python.")
        self.assertLess(brief_res["score"], 60)

        detailed_answer = " ".join(["We scaled our distributed API architecture using Redis and asynchronous Kafka messaging to resolve latency spikes."] * 10)
        detailed_res = fallback_score(detailed_answer)
        self.assertGreaterEqual(detailed_res["score"], 80)

    def test_question_generator(self):
        frontend_q = generate_questions("frontend")
        self.assertTrue(any("React" in q or "DOM" in q for q in frontend_q))

        backend_q = generate_questions("backend")
        self.assertTrue(any("Python" in q or "REST" in q or "database" in q for q in backend_q))

        generic_q = generate_questions("manager")
        self.assertTrue(len(generic_q) > 0)

    def test_skill_gap_finder(self):
        current = ["Python", "FastAPI"]
        target = ["Python", "FastAPI", "Kubernetes", "AWS"]
        gaps = find_skill_gaps(current, target)
        self.assertIn("kubernetes", gaps)
        self.assertIn("aws", gaps)
        self.assertNotIn("python", gaps)

    def test_weak_area_recommender(self):
        recs = recommend_for_weak_areas(["System Design", "SQL Indexing"])
        self.assertEqual(len(recs), 2)
        self.assertEqual(recs[0]["topic"], "System Design")

    def test_job_and_course_recommender(self):
        courses = fallback_predict_courses(["python", "react"])
        self.assertGreaterEqual(len(courses), 1)
        self.assertIn("title", courses[0])

        jobs = fallback_predict_jobs(["python", "react"])
        self.assertGreaterEqual(len(jobs), 1)
        self.assertIn("title", jobs[0])
        self.assertIn("match_score", jobs[0])

    def test_vector_similarity_math(self):
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        v3 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(cosine_similarity(v1, v2), 1.0)
        self.assertAlmostEqual(cosine_similarity(v1, v3), 0.0)

        tfidf_exact = tfidf_similarity("python fastapi react", "python fastapi react")
        self.assertAlmostEqual(tfidf_exact, 1.0)

        tfidf_zero = tfidf_similarity("kubernetes terraform", "python django")
        self.assertEqual(tfidf_zero, 0.0)

    def test_confidence_analyzer(self):
        fluent_text = "I designed and implemented the architecture decisively with quantifiable outcomes."
        conf = analyze_confidence(text=fluent_text)
        self.assertGreaterEqual(conf, 0.8)

        filler_text = "Um I think like you know uh maybe we did like something um."
        conf_low = analyze_confidence(text=filler_text)
        self.assertLess(conf_low, 0.7)

    def test_rubric(self):
        rubric = get_rubric()
        self.assertIn("communication", rubric)
        self.assertIn("technical_accuracy", rubric)
        self.assertIn("problem_solving", rubric)
        total_weight = sum(item["weight"] for item in rubric.values())
        self.assertAlmostEqual(total_weight, 1.0)

if __name__ == "__main__":
    unittest.main()
