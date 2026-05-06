from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app import models, schemas

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=list[schemas.Project])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    projects = db.query(models.Project).filter(models.Project.owner_id == current_user.id).order_by(models.Project.created_at.desc()).all()
    return projects

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(
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
    return project

@router.get("/{project_id}/files", response_model=list[schemas.GeneratedFile])
def get_project_files(
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
        
    return project.files
