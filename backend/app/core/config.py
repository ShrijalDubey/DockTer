from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "DockerGen API"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = "sqlite:///./dockergen.db"
    
    JWT_SECRET_KEY: str = "supersecretkey_dockergen_dev"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    GROQ_API_KEY: str = ""
    
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

settings = Settings()
