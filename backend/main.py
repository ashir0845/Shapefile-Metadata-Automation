import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.models.history import GeneratedFileHistory
from backend.routes.history import router as history_router
from backend.routes.metadata import router as metadata_router
from backend.routes.auth import router as auth_router

# =========================================================
# DATABASE TABLES
# =========================================================
#
# This creates missing tables/columns only when the table
# does not already exist. For the new publication_date
# column in an existing PostgreSQL table, run the ALTER TABLE
# command provided below in the setup instructions.
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
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
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

app.include_router(
    metadata_router
)

app.include_router(
    history_router
)
app.include_router(auth_router)

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
