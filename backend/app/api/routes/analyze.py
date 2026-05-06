import os
import shutil
import tempfile
import zipfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app import models, schemas
from app.services.analyzer import analyze_project
import git

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/upload", response_model=schemas.Project)
async def analyze_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")

    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        extract_dir = os.path.join(temp_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        # Analyze
        context = analyze_project(extract_dir)
        
        project = models.Project(
            name=file.filename.replace('.zip', ''),
            source_type="upload",
            status="analyzed",
            analysis_context=context,
            owner_id=current_user.id
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return project

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.post("/github", response_model=schemas.Project)
async def analyze_github(
    body: schemas.AnalyzeGithubRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    url = body.url
    if not url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Only GitHub URLs are supported")

    temp_dir = tempfile.mkdtemp()
    
    try:
        git.Repo.clone_from(url, temp_dir, depth=1)
        
        # Analyze
        context = analyze_project(temp_dir)
        
        project_name = url.split("/")[-1].replace(".git", "")
        
        project = models.Project(
            name=project_name,
            source_type="github",
            source_url=url,
            status="analyzed",
            analysis_context=context,
            owner_id=current_user.id
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return project

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
