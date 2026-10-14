import unittest
from datetime import timedelta
from jose import jwt
import sys
import os

SERVER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../server"))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from config.settings import settings
from app.middleware.auth import (
    verify_password,
    get_password_hash,
    create_access_token
)

class TestAuthSecurity(unittest.TestCase):
    def test_password_hashing_and_verification(self):
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        self.assertNotEqual(password, hashed)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("WrongPassword!", hashed))
        self.assertFalse(verify_password("", hashed))
        self.assertFalse(verify_password(password, ""))

    def test_create_access_token_and_decode(self):
        data = {"sub": "test@example.com"}
        token = create_access_token(data, expires_delta=timedelta(minutes=10))
        self.assertIsInstance(token, str)

        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        self.assertEqual(payload.get("sub"), "test@example.com")
        self.assertIn("exp", payload)

    def test_token_expiration_delta(self):
        data = {"sub": "expired@example.com"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-10))
        with self.assertRaises(jwt.ExpiredSignatureError):
            jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

if __name__ == "__main__":
    unittest.main()
