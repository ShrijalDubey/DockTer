from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class GeneratedFile(Base):
    __tablename__ = "generated_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    file_name = Column(String)
    content = Column(Text)

    project = relationship("Project", back_populates="files")
