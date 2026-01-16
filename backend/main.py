import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import database and routes
from core.database import init_db
from api import clusters_router, manuals_router, modules_router, translation_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")
    yield
    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(
    title="Shiksha-Setu API",
    description="Dynamic Teacher Training Platform - Backend API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(clusters_router)
app.include_router(manuals_router)
app.include_router(modules_router)
app.include_router(translation_router)

@app.get("/")
async def root():
    return {
        "message": "Shiksha-Setu API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "clusters": "/api/clusters",
            "manuals": "/api/manuals",
            "translation": "/api/translation",
            "modules": "/api/modules",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/favicon.ico")
async def favicon():
    # Return empty response to avoid 404 in logs
    return Response(status_code=204)

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 for local access, or 0.0.0.0 for network access
    uvicorn.run(app, host="127.0.0.1", port=8000)
