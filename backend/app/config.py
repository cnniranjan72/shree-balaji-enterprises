from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Database
    database_url: str
    
    # Business Info
    business_name: str = "Shree Balaji Enterprises"
    business_address: str = ""
    business_gstin: str = ""
    business_phone: str = ""
    business_bank_name: str = ""
    business_account_number: str = ""
    business_ifsc: str = ""
    business_branch: str = ""
    
    # URLs
    backend_base_url: str = "http://localhost:8000"
    frontend_url: str = "https://shree-balaji-enterprises.vercel.app"
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # System env vars take precedence over .env file
        # This is critical for Render where env vars are set in dashboard
        extra = "ignore"


@lru_cache()
def get_settings():
    settings = Settings()
    
    # Validate required environment variables
    if not settings.database_url:
        raise ValueError("DATABASE_URL is required")
    
    return settings
