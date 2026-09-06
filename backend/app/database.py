from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings

settings = get_settings()

# Use psycopg3 (installed via psycopg[binary]) for postgresql:// URLs
_db_url = settings.database_url
if _db_url.startswith('postgresql://'):
    _db_url = _db_url.replace('postgresql://', 'postgresql+psycopg://', 1)

# pool_pre_ping=True: validates each pooled connection before use so stale
# connections terminated by the serverless DB (Neon) are transparently replaced.
# This prevents "SSL connection has been closed unexpectedly" errors.
engine = create_engine(_db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
