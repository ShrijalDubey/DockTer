from pydantic import BaseModel

class GeneratedFileBase(BaseModel):
    file_name: str
    content: str

class GeneratedFile(GeneratedFileBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True
