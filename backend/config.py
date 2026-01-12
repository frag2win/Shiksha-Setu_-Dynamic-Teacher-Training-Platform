from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    groq_api_key: str
    google_translate_api_key: Optional[str] = None
    database_url: str = "sqlite:///./shiksha_setu.db"
    chroma_persist_directory: str = "./chroma_db"
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
