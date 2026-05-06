from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    source_type = Column(String) # 'upload' or 'github'
    source_url = Column(String, nullable=True) # if github
    status = Column(String, default="analyzed") # 'analyzed', 'generated', 'error'
    analysis_context = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")

    files = relationship("GeneratedFile", back_populates="project")
