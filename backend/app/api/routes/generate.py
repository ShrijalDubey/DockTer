from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app import models, schemas
from app.services.generator import generate_docker_files

router = APIRouter(prefix="/generate", tags=["generate"])

@router.post("/{project_id}", response_model=list[schemas.GeneratedFile])
async def generate_project_files(
    project_id: int,
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
        docker_files = generate_docker_files(project.analysis_context)
        
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
