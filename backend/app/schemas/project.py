from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    source_type: str
    source_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    status: str
    analysis_context: Optional[Dict[str, Any]] = None
    created_at: datetime
    owner_id: int
    class Config:
        from_attributes = True

class AnalyzeGithubRequest(BaseModel):
    url: str
