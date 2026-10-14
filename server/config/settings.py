import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Locate and load root .env or local .env automatically
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
root_env_path = os.path.join(ROOT_DIR, ".env")
local_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env"))

if os.path.exists(root_env_path):
    load_dotenv(root_env_path)
elif os.path.exists(local_env_path):
    load_dotenv(local_env_path)
else:
    load_dotenv()

# Deterministic absolute path to sqlite database in server/careercraft.db
DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../careercraft.db"))

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_here")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

settings = Settings()
