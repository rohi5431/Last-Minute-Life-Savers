import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@postgres:5432/lifesaver"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "change-me-in-production"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_CALENDAR_SCOPES: str = "https://www.googleapis.com/auth/calendar.readonly,openid,email"
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/calendar/oauth/callback"
    FRONTEND_URL: str = "http://localhost:5173"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    GROQ_MODEL: str = "llama3-70b-8192"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    WS_HEARTBEAT: int = 30

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def calendar_scopes_list(self) -> List[str]:
        return [s.strip() for s in self.GOOGLE_CALENDAR_SCOPES.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
