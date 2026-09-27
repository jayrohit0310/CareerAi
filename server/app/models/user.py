from sqlalchemy import Column, Integer, String, Text
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # ML Extracted Data
    extracted_skills = Column(Text, nullable=True) # Stored as comma separated string
    predicted_role = Column(String, nullable=True)
