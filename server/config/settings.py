import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Fallback to sqlite if postgres is not available
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careercraft.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_here")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

settings = Settings()
