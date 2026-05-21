from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models.base import Base

from app.api.routes import auth, analyze, generate, projects

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for analyzing projects and generating Docker files"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(projects.router, prefix="/api")

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
