from fastapi import FastAPI

from backend.routes.metadata import router as metadata_router


app = FastAPI(
    title="GIS Metadata Generator API",
    description="API for generating and retrieving GIS metadata",
    version="1.0.0"
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