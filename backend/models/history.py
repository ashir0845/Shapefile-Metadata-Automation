from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class GeneratedFileHistory(Base):
    __tablename__ = "generated_file_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    original_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Entity comes from the reviewed main metadata field:
    # "Entity Label" -> e.g. "State"
    entity: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # This stores the COMPLETE value from:
    # "Publication Date"
    #
    # Example:
    # "31st March 2025 (Current Date)"
    #
    # It intentionally stores the complete text rather than
    # extracting only "2025".
    publication_date: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Kept for compatibility with history records created by
    # the earlier version of the application.
    year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    records_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    attributes_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="success",
        nullable=False,
    )

    generated_file_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )
