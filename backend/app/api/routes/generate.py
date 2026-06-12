from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app import models, schemas
from app.services.generator import generate_docker_files
from app.core.rate_limiter import rate_limit, direct_gen_limiter, general_limiter

from pydantic import BaseModel

router = APIRouter(prefix="/generate", tags=["generate"])

class DirectGenerateRequest(BaseModel):
    context: dict
    preferences: Optional[schemas.GenerationPreferences] = None

@router.post("/direct", dependencies=[Depends(rate_limit(direct_gen_limiter))])
async def generate_direct(body: DirectGenerateRequest):
    try:
        prefs_dict = body.preferences.dict() if body.preferences else {
            "base_image_type": "default",
            "enable_hot_reload": False,
            "pin_versions": False,
            "orchestration_target": "compose"
        }
        docker_files = generate_docker_files(body.context, prefs_dict)
        return docker_files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}", response_model=list[schemas.GeneratedFile], dependencies=[Depends(rate_limit(general_limiter))])
async def generate_project_files(
    project_id: int,
    prefs: Optional[schemas.GenerationPreferences] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
 
    if not project.analysis_context:
        raise HTTPException(status_code=400, detail="Project has no analysis context")
 
    try:
        # Delete existing generated files for this project to support fresh regeneration
        db.query(models.GeneratedFile).filter(models.GeneratedFile.project_id == project.id).delete()
        db.commit()

        prefs_dict = prefs.dict() if prefs else {"base_image_type": "default", "enable_hot_reload": False, "pin_versions": False}
        docker_files = generate_docker_files(project.analysis_context, prefs_dict)
        
        generated_records = []
        for file_name, content in docker_files.items():
            gen_file = models.GeneratedFile(
                project_id=project.id,
                file_name=file_name,
                content=content
            )
            db.add(gen_file)
            generated_records.append(gen_file)
            
        project.status = "generated"
        db.commit()
        
        for r in generated_records:
            db.refresh(r)
            
        return generated_records

    except Exception as e:
        project.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
