from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.metadata import router as metadata_router


app = FastAPI(
    title="GIS Metadata Generator API",
    description="API for generating and retrieving GIS metadata",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(metadata_router)


@app.get("/")
def root():
    return {
        "message": "GIS Metadata Generator API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }