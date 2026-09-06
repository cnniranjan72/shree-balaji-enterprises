from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import customers, products, sales, export, business
from .routers import purchase_suppliers, purchase_products, purchases, purchase_export
from .config import get_settings

# Get settings and validate environment variables
settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GST Billing System", version="1.0.0")

# Configure CORS - hardcoded production origin + local dev origins
# This guarantees the production frontend is ALWAYS allowed regardless of env parsing
origins = [
    "https://shree-balaji-enterprises.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

# Also add FRONTEND_URL from env if it's different (strip trailing slash/whitespace)
if settings.frontend_url:
    cleaned_url = settings.frontend_url.strip().rstrip("/")
    if cleaned_url and cleaned_url not in origins:
        origins.append(cleaned_url)

# Log CORS config on every startup (visible in Render logs)
print(f"🔧 CORS Configuration:")
print(f"  Allowed origins: {origins}")
print(f"  FRONTEND_URL env: '{settings.frontend_url}'")
print(f"  ENVIRONMENT: {settings.environment}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(export.router)
app.include_router(business.router)
app.include_router(purchase_suppliers.router)
app.include_router(purchase_products.router)
app.include_router(purchases.router)
app.include_router(purchase_export.router)


@app.get("/")
def read_root():
    return {"message": "GST Billing System API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/debug/cors")
def debug_cors():
    """Temporary debug endpoint to verify CORS configuration on production."""
    return {
        "configured_origins": origins,
        "frontend_url_env": settings.frontend_url,
        "environment": settings.environment,
        "note": "Remove this endpoint after verifying CORS works"
    }
