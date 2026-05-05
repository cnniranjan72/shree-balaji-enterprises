from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import customers, products, sales, export, business
from .config import get_settings

# Get settings and validate environment variables
settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GST Billing System", version="1.0.0")

# Configure CORS with explicit production frontend URL
origins = [
    "https://shree-balaji-enterprises.vercel.app",
    "http://localhost:3000"  # for local testing
]

# Debug logging for CORS configuration
if settings.environment == "development":
    print(f"🔧 CORS Configuration:")
    print(f"  Allowed origins: {origins}")
    print(f"  Frontend URL: {settings.frontend_url}")

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

@app.get("/")
def read_root():
    return {"message": "GST Billing System API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
