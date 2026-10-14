import unittest
import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from ml.resume_parser.enhanced_parser import parse_resume_structure, fallback_parse_resume
from ml.question_generator.smart_generator import (
    generate_interview_question_sequence,
    generate_followup_question
)
from ml.scoring.advanced_evaluator import evaluate_interview_response
from ml.scoring.report_generator import generate_interview_performance_report

class TestEnhancedInterviewSystem(unittest.TestCase):

    def setUp(self):
        self.sample_resume_text = """
Jane Doe
Senior Full-Stack & Systems Engineer

TECHNICAL SKILLS:
Programming Languages: Python, TypeScript, Go
Frameworks: React, FastAPI, Next.js, Docker, Kubernetes, PostgreSQL, Redis

PROJECTS:
Distributed File Vault:
Engineered an encrypted object storage microservice using FastAPI, Redis caching, and PostgreSQL.
Designed custom chunked uploads and sha256 deduplication to reduce storage overhead by 35%.
Solved concurrency bottlenecks using optimistic locking.

E-Commerce Recommendation Engine:
Implemented matrix factorization collaborative filtering using Python and NumPy.
Integrated real-time vector search using pgvector.

INTERNSHIPS & EXPERIENCE:
CloudScale Technologies - Software Engineering Intern:
Built automated telemetry dashboards using Go and Prometheus.
Assisted senior engineers in mitigating latency spikes across distributed RPC microservices.
Authored unit and integration test suites with 92% coverage.

EDUCATION:
Bachelor of Science in Computer Science, State University, 2024.
"""

    def test_01_enhanced_resume_parser(self):
        """Verify projects, internships, skills, and claims are extracted."""
        parsed = parse_resume_structure(self.sample_resume_text)
        self.assertIn("skills", parsed)
        self.assertTrue(len(parsed["skills"]) >= 3)
        self.assertTrue(any("Python" in s or "React" in s or "FastAPI" in s for s in parsed["skills"]))
        
        self.assertIn("projects", parsed)
        self.assertTrue(len(parsed["projects"]) >= 1)
        
        self.assertIn("internships", parsed)
        self.assertTrue(len(parsed["internships"]) >= 1)

    def test_02_difficulty_question_generation(self):
        """Verify beginner, intermediate, and advanced produce differentiated questions."""
        parsed = parse_resume_structure(self.sample_resume_text)

        # Beginner
        q_beg = generate_interview_question_sequence(
            interview_type="resume",
            difficulty="beginner",
            duration_minutes=5,
            parsed_resume=parsed
        )
        self.assertTrue(len(q_beg) >= 2)
        # Beginner questions should focus on fundamentals
        beg_text = " ".join([q["question_text"].lower() for q in q_beg])
        self.assertTrue(any(w in beg_text for w in ["what", "walk", "role", "feature", "why"]))

        # Advanced
        q_adv = generate_interview_question_sequence(
            interview_type="resume",
            difficulty="advanced",
            duration_minutes=5,
            parsed_resume=parsed
        )
        self.assertTrue(len(q_adv) >= 2)
        # Advanced questions should mention architecture, scale, bottleneck, or trade-offs
        adv_text = " ".join([q["question_text"].lower() for q in q_adv])
        self.assertTrue(any(w in adv_text for w in ["bottleneck", "scale", "concurrency", "trade-off", "architecture", "redesign"]))

    def test_03_followup_question_generation(self):
        """Verify follow-up question generator responds intelligently."""
        q = "How did you design database caching for your service?"
        a_brief = "I used redis to make it fast."
        followup = generate_followup_question(q, a_brief, difficulty="intermediate")
        self.assertIsNotNone(followup)
        self.assertTrue(len(followup) > 10)

    def test_04_advanced_answer_evaluation(self):
        """Verify answer scoring out of 10, STAR feedback, and ideal answers."""
        q = "Describe how you handled database indexing in your project."
        a = "In our distributed service, database queries on the user transactions table were causing high latency. I analyzed the query execution plans using EXPLAIN ANALYZE and identified sequential table scans. I added composite B-tree indexes on user_id and timestamp, which dropped query execution times from 420ms to 12ms."

        eval_res = evaluate_interview_response(
            question=q,
            answer=a,
            difficulty="intermediate",
            topic="Database Indexing"
        )
        self.assertIn("score_10", eval_res)
        self.assertTrue(eval_res["score_10"] >= 6.0)
        self.assertIn("strengths", eval_res)
        self.assertIn("ideal_answer", eval_res)
        self.assertIn("disclaimer", eval_res)

    def test_05_performance_report_synthesizer(self):
        """Verify comprehensive report synthesis with grades and topic breakdowns."""
        mock_qa = [
            {
                "question_index": 0,
                "question_text": "Explain your microservice architecture.",
                "user_answer": "I built a decoupled REST microservice architecture with async messaging and PostgreSQL.",
                "score_10": 8.5,
                "strengths": "Clear architecture explanation.",
                "missing_concepts": "Could quantify throughput.",
                "topic": "Microservices"
            },
            {
                "question_index": 1,
                "question_text": "How did you handle cache invalidation?",
                "user_answer": "We used TTLs and pub/sub events for cache purging.",
                "score_10": 8.0,
                "strengths": "Decisive tech choices.",
                "missing_concepts": "Race condition mitigation.",
                "topic": "Caching Strategy"
            }
        ]

        report = generate_interview_performance_report(
            session_config={"interview_type": "resume", "difficulty": "intermediate", "question_count": 2},
            qa_list=mock_qa,
            total_time_spent_seconds=480
        )

        self.assertIn("overall_score_10", report)
        self.assertEqual(report["questions_attempted"], 2)
        self.assertEqual(report["questions_unanswered"], 0)
        self.assertIn("grade", report)
        self.assertIn("performance_by_topic", report)
        self.assertTrue(len(report["performance_by_topic"]) >= 1)
        self.assertIn("recommended_study_topics", report)

if __name__ == "__main__":
    unittest.main()
