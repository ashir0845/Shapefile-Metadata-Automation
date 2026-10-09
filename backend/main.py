import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.models.history import GeneratedFileHistory  # noqa: F401
from backend.routes.admin import router as admin_router
from backend.routes.auth import router as auth_router
from backend.routes.history import router as history_router
from backend.routes.metadata import router as metadata_router


# =========================================================
# DATABASE TABLES
# =========================================================
# Creates missing tables only. New columns on existing tables
# come from backend/migrations/001_admin_and_user_history.sql.
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="GIS Metadata Generator API",
    description=(
        "API for generating and retrieving GIS metadata"
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

CORS_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# =========================================================
# ROUTES
# =========================================================

app.include_router(metadata_router)
app.include_router(history_router)
app.include_router(auth_router)
app.include_router(admin_router)


# =========================================================
# BASIC ENDPOINTS
# =========================================================

@app.get("/")
def root():
    return {
        "message": (
            "GIS Metadata Generator API is running"
        )
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }