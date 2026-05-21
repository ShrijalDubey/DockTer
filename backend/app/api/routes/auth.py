from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

from app.api.deps import get_db, get_current_user
from app.core.security import create_access_token
from app.core.config import settings
from app import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user



@router.get("/github/login")
def github_login():
    client_id = settings.GITHUB_CLIENT_ID
    if not client_id:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured")
    
    github_auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=user:email"
    return RedirectResponse(url=github_auth_url)

@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")
        
    async with httpx.AsyncClient() as client:
        # 1. Exchange code for access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            }
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token from GitHub")
            
        # 2. Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        user_data = user_response.json()
        github_id = str(user_data.get("id"))
        username = user_data.get("login")
        avatar_url = user_data.get("avatar_url")
        email = user_data.get("email")
        
        if not github_id or not username:
            raise HTTPException(status_code=400, detail="Failed to get user details from GitHub")

        # 3. If no public email, try the emails endpoint
        if not email:
            try:
                emails_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github.v3+json"
                    }
                )
                emails_data = emails_response.json()
                if isinstance(emails_data, list):
                    primary = next((e for e in emails_data if e.get("primary")), None)
                    if primary:
                        email = primary.get("email")
            except Exception:
                pass  # Email is optional, don't fail the flow
            
    # 4. Find or create user
    user = db.query(models.User).filter(models.User.github_id == github_id).first()
    if user:
        # Update avatar_url and email on each login (they can change)
        user.avatar_url = avatar_url
        if email:
            user.email = email
        db.commit()
        db.refresh(user)
    else:
        # Check if username is taken by non-github user
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if existing_user:
            username = f"{username}_{github_id[:4]}"
            
        user = models.User(
            username=username,
            github_id=github_id,
            avatar_url=avatar_url,
            email=email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # 5. Generate our JWT and redirect to frontend
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    our_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    redirect_url = f"{settings.FRONTEND_URL}/?token={our_token}"
    return RedirectResponse(url=redirect_url)

