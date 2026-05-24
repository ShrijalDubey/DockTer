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

def secure_extract_zip(zip_path: str, extract_dir: str, max_size_mb: int = 100):
    max_bytes = max_size_mb * 1024 * 1024
    total_uncompressed_size = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        base_path = os.path.abspath(extract_dir)
        for member in zip_ref.infolist():
            total_uncompressed_size += member.file_size
            if total_uncompressed_size > max_bytes:
                raise HTTPException(status_code=400, detail="Decompressed archive exceeds maximum allowed size (100MB)")
                
            target_path = os.path.abspath(os.path.join(extract_dir, member.filename))
            if not target_path.startswith(base_path):
                raise HTTPException(status_code=400, detail="Malicious path traversal detected inside archive")
                
            zip_ref.extract(member, extract_dir)

@router.post("/direct")
async def analyze_direct(
    file: UploadFile = File(...)
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
        
        secure_extract_zip(zip_path, extract_dir)

        # Analyze
        context = analyze_project(extract_dir)
        return context

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

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
        
        secure_extract_zip(zip_path, extract_dir)

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
