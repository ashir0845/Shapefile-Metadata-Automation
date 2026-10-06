import os
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.history import GeneratedFileHistory


router = APIRouter(
    prefix="/api/history",
    tags=["History"],
)


def serialize_created_at(value):
    """
    Return created_at as an ISO-8601 UTC timestamp.

    Older records may have been stored as naive UTC timestamps,
    so they are explicitly treated as UTC before serialization.
    """

    if value is None:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc).isoformat()


@router.get("")
def get_history(
    db: Session = Depends(get_db),
):
    records = (
        db.query(GeneratedFileHistory)
        .order_by(
            GeneratedFileHistory.created_at.desc()
        )
        .all()
    )

    history = []

    for record in records:
        history.append(
            {
                "id": record.id,
                "filename": record.filename,
                "original_filename": record.original_filename,

                # Exact Entity Label value.
                "entity": record.entity,

                # Exact complete Publication Date value.
                "publication_date": record.publication_date,

                # Backward-compatible field.
                # New records use publication_date for the
                # History table's "Year" column.
                "year": (
                    record.publication_date
                    if record.publication_date
                    else (
                        str(record.year)
                        if record.year is not None
                        else None
                    )
                ),

                "created_at": serialize_created_at(
                    record.created_at
                ),

                "records_count": record.records_count,
                "attributes_count": record.attributes_count,
                "status": record.status,
            }
        )

    return history


@router.get("/{history_id}/download")
def download_history_file(
    history_id: int,
    db: Session = Depends(get_db),
):
    record = (
        db.query(GeneratedFileHistory)
        .filter(
            GeneratedFileHistory.id == history_id
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="History record not found.",
        )

    if not os.path.exists(
        record.generated_file_path
    ):
        raise HTTPException(
            status_code=404,
            detail=(
                "Generated Excel file no longer exists."
            ),
        )

    return FileResponse(
        path=record.generated_file_path,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        filename=record.filename,
    )


@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
):
    record = (
        db.query(GeneratedFileHistory)
        .filter(
            GeneratedFileHistory.id == history_id
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="History record not found.",
        )

    # Delete the generated Excel file first.
    if os.path.exists(
        record.generated_file_path
    ):
        try:
            os.remove(
                record.generated_file_path
            )
        except OSError as exc:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Could not delete generated "
                    f"Excel file: {exc}"
                ),
            )

    # Delete the PostgreSQL history record.
    db.delete(record)
    db.commit()

    return {
        "message": (
            "History record deleted successfully."
        ),
        "id": history_id,
    }
