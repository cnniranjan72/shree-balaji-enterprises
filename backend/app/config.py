from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

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
        # Also look for .env in parent directory (when running from backend/)
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    # Try to find .env file - check current dir and parent
    env_file = ".env"
    if not os.path.exists(env_file):
        parent_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        if os.path.exists(parent_env):
            env_file = parent_env
    
    settings = Settings(_env_file=env_file)
    
    # Validate required environment variables
    if not settings.database_url:
        raise ValueError("DATABASE_URL is required")
    
    # Debug info for development
    if settings.environment == "development":
        print(f"🔧 Development Mode:")
        print(f"  Database URL: {settings.database_url[:50]}...")
        print(f"  Backend URL: {settings.backend_base_url}")
        print(f"  Frontend URL: {settings.frontend_url}")
    
    return settings
