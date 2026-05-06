from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True) # nullable for github users
    github_id = Column(String, unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    email = Column(String, nullable=True)

    projects = relationship("Project", back_populates="owner")
