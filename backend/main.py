from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.services.database import connect_to_database, close_database_connection
from app.routes import auth, users, triage, hospitals, medicines, reports, admin
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    # Startup
    print("Starting AroNexa Backend...")
    await connect_to_database()

    # Diagnostics — show config status at startup
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and len(groq_key) > 10:
        print(f"✅ Groq API Key: configured ({groq_key[:8]}...)")
    else:
        print("⚠️  Groq API Key: NOT SET — multilingual translation and report analysis will use fallbacks")

    # Auto-seed hospitals if collection is empty
    try:
        from app.services.hospital_service import HospitalService
        hospital_svc = HospitalService()
        count = await hospital_svc.seed_hospitals()
        print(f"✅ Hospitals ready: {count} in database")
    except Exception as e:
        print(f"⚠️  Hospital seeding note: {e}")

    yield
    # Shutdown
    await close_database_connection()
    print("AroNexa Backend stopped.")


app = FastAPI(
    title="AroNexa API",
    description="AI-Powered Rural Health Assistant - Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(medicines.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "🏥 Welcome to AroNexa API",
        "description": "AI-Powered Rural Health Assistant",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "OK"
    }


@app.get("/health")
async def health_check():
    groq_key = os.getenv("GROQ_API_KEY", "")
    return {
        "status": "healthy",
        "service": "AroNexa Backend",
        "groq_configured": bool(groq_key and len(groq_key) > 10),
        "features": {
            "multilingual": bool(groq_key),
            "report_analysis": bool(groq_key),
            "hospital_finder": True,
            "symptom_checker": True
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )