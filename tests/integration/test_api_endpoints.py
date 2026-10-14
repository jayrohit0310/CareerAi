import unittest
import os
import sys
import io
import uuid

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
SERVER_DIR = os.path.join(ROOT_DIR, "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.unique_suffix = uuid.uuid4().hex[:6]
        cls.test_email = f"tester_{cls.unique_suffix}@careercraft.ai"
        cls.test_password = "SecurePassword123!"
        cls.token = None

    def test_01_root_and_health(self):
        root_resp = self.client.get("/")
        self.assertEqual(root_resp.status_code, 200)
        self.assertIn("message", root_resp.json())

        health_resp = self.client.get("/health")
        self.assertEqual(health_resp.status_code, 200)
        self.assertEqual(health_resp.json().get("status"), "healthy")

    def test_02_auth_signup_and_login_flow(self):
        # 1. Signup
        signup_resp = self.client.post("/auth/signup", json={
            "email": self.test_email,
            "password": self.test_password
        })
        self.assertEqual(signup_resp.status_code, 200)
        self.assertEqual(signup_resp.json().get("email"), self.test_email)

        # 2. Duplicate Signup should fail with 400
        dup_resp = self.client.post("/auth/signup", json={
            "email": self.test_email,
            "password": self.test_password
        })
        self.assertEqual(dup_resp.status_code, 400)

        # 3. Login with wrong password should fail with 401
        bad_login = self.client.post("/auth/login", data={
            "username": self.test_email,
            "password": "WrongPassword!"
        })
        self.assertEqual(bad_login.status_code, 401)

        # 4. Login with correct credentials
        login_resp = self.client.post("/auth/login", data={
            "username": self.test_email,
            "password": self.test_password
        })
        self.assertEqual(login_resp.status_code, 200)
        token = login_resp.json().get("access_token")
        self.assertIsNotNone(token)
        self.__class__.token = token

    def test_03_auth_protected_me_and_skills(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}

        # Unauthenticated request should fail with 401
        unauth_resp = self.client.get("/auth/me")
        self.assertEqual(unauth_resp.status_code, 401)

        # Authenticated request should succeed
        me_resp = self.client.get("/auth/me", headers=headers)
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json().get("email"), self.test_email)

        # Update skills
        update_resp = self.client.put("/auth/skills", json={
            "skills": ["Python", "FastAPI", "React", "Docker"]
        }, headers=headers)
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json().get("skills"), ["Python", "FastAPI", "React", "Docker"])

    def test_04_resume_upload_endpoint(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}

        # 1. Non-PDF upload should fail with 400
        text_file = io.BytesIO(b"Not a PDF file content")
        bad_resp = self.client.post(
            "/resume/upload",
            files={"file": ("resume.txt", text_file, "text/plain")},
            headers=headers
        )
        self.assertEqual(bad_resp.status_code, 400)

        # 2. Minimal valid PDF upload
        # PDF minimal binary header and trailer
        minimal_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        pdf_file = io.BytesIO(minimal_pdf)
        pdf_resp = self.client.post(
            "/resume/upload",
            files={"file": ("candidate_resume.pdf", pdf_file, "application/pdf")},
            headers=headers
        )
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertIn("skills", pdf_resp.json())

    def test_05_career_matches_endpoint(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}
        resp = self.client.get("/career/matches", headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("matches", data)
        self.assertGreaterEqual(len(data["matches"]), 1)
        self.assertIn("match_percentage", data["matches"][0])

    def test_06_salary_estimate_endpoint(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}
        resp = self.client.get("/salary/estimate?role=Software%20Engineer&experience_years=3", headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("median_salary", data)
        self.assertIn("min_salary", data)
        self.assertIn("max_salary", data)
        self.assertGreater(data["median_salary"], 0)

    def test_07_interview_lifecycle(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}

        # 1. Start interview
        start_resp = self.client.post("/interview/start", headers=headers)
        self.assertEqual(start_resp.status_code, 200)
        sess_data = start_resp.json()
        session_id = sess_data.get("session_id")
        self.assertIsNotNone(session_id)
        self.assertIn("first_question", sess_data)

        # 2. Submit answer
        answer_resp = self.client.post("/interview/submit-answer", json={
            "session_id": session_id,
            "answer_text": "In our distributed service architecture, I implemented Redis caching and asynchronous message workers using Celery to decouple bottleneck queries, reducing response times by 40%."
        }, headers=headers)
        self.assertEqual(answer_resp.status_code, 200)
        ans_data = answer_resp.json()
        self.assertIn("score", ans_data)
        self.assertIn("feedback", ans_data)
        self.assertIn("next_question", ans_data)

        # 3. Audio transcription endpoint with dummy webm
        audio_dummy = io.BytesIO(b"\x1a\x45\xdf\xa3dummy_webm_bytes")
        trans_resp = self.client.post(
            "/interview/transcribe-audio",
            files={"audio": ("test_record.webm", audio_dummy, "audio/webm")},
            headers=headers
        )
        self.assertEqual(trans_resp.status_code, 200)
        self.assertIn("transcript", trans_resp.json())

    def test_08_chatbot_message_endpoint(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}
        resp = self.client.post("/chatbot/message", json={
            "message": "What is the STAR method for behavioral interviews?"
        }, headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("reply", data)
        self.assertGreater(len(data["reply"]), 10)

    def test_09_course_and_job_recommendation_endpoints(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}

        course_resp = self.client.get("/course/recommendations", headers=headers)
        self.assertEqual(course_resp.status_code, 200)
        c_data = course_resp.json()
        self.assertIn("courses", c_data)
        self.assertGreaterEqual(len(c_data["courses"]), 1)

        job_resp = self.client.get("/jobs/recommendations", headers=headers)
        self.assertEqual(job_resp.status_code, 200)
        j_data = job_resp.json()
        self.assertIn("jobs", j_data)
        self.assertGreaterEqual(len(j_data["jobs"]), 1)

    def test_10_feedback_endpoint(self):
        headers = {"Authorization": f"Bearer {self.__class__.token}"}

        # Valid feedback
        fb_resp = self.client.post("/feedback", json={
            "subject": "Platform Feedback",
            "message": "The mock interview simulator and STAR coaching are exceptionally helpful!"
        }, headers=headers)
        self.assertEqual(fb_resp.status_code, 200)
        self.assertEqual(fb_resp.json().get("status"), "success")

        # Invalid feedback (too short)
        bad_fb = self.client.post("/feedback", json={
            "subject": "",
            "message": "bad"
        }, headers=headers)
        self.assertEqual(bad_fb.status_code, 422)

if __name__ == "__main__":
    unittest.main()
