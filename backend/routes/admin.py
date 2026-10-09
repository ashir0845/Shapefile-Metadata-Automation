import re

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.auth_utils import (
    MIN_PASSWORD_LENGTH,
    get_current_user,
    pwd_context,
    require_admin,
)
from backend.database import get_db
from backend.models.history import GeneratedFileHistory
from backend.models.user import User
from backend.routes.history import serialize_history_record


# Every route in this router requires an Admin token.
router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)

ALLOWED_ROLES = {"User", "Admin"}
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str = "User"
    email: str | None = None


class UpdateUserRequest(BaseModel):
    # Only fields that are sent are changed.
    # An empty email clears it. An empty password keeps the current one.
    username: str | None = None
    email: str | None = None
    password: str | None = None
    role: str | None = None


# =========================================================
# HELPERS
# =========================================================

def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


def get_user_or_404(db: Session, user_id: int) -> User:
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


def validate_username(value: str) -> str:
    username = value.strip()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username is required.",
        )

    if len(username) > 100:
        raise HTTPException(
            status_code=400,
            detail="Username must be 100 characters or fewer.",
        )

    return username


def validate_password(value: str) -> None:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least "
                f"{MIN_PASSWORD_LENGTH} characters."
            ),
        )


def normalize_email(value: str | None) -> str | None:
    if value is None:
        return None

    email = value.strip().lower()

    if not email:
        return None

    if not EMAIL_PATTERN.match(email):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid email address.",
        )

    return email


def check_unique(
    db: Session,
    username: str | None = None,
    email: str | None = None,
    exclude_user_id: int | None = None,
) -> None:
    if username is not None:
        query = db.query(User).filter(User.username == username)

        if exclude_user_id is not None:
            query = query.filter(User.id != exclude_user_id)

        if query.first() is not None:
            raise HTTPException(
                status_code=400,
                detail="Username already exists.",
            )

    if email:
        query = db.query(User).filter(
            func.lower(User.email) == email
        )

        if exclude_user_id is not None:
            query = query.filter(User.id != exclude_user_id)

        if query.first() is not None:
            raise HTTPException(
                status_code=400,
                detail="Email is already used by another user.",
            )


# =========================================================
# USERS
# =========================================================

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .order_by(User.username.asc())
        .all()
    )

    return [serialize_user(user) for user in users]


@router.post("/users", status_code=201)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
):
    username = validate_username(request.username)
    validate_password(request.password)

    if request.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Role must be 'User' or 'Admin'.",
        )

    email = normalize_email(request.email)

    check_unique(db, username=username, email=email)

    user = User(
        username=username,
        email=email,
        password_hash=pwd_context.hash(request.password),
        role=request.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return serialize_user(user)


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_user_or_404(db, user_id)

    if request.username is not None:
        new_username = validate_username(request.username)

        check_unique(
            db,
            username=new_username,
            exclude_user_id=user.id,
        )

        user.username = new_username

        # Keep the stored name on this user's history files in step,
        # so the new name shows on every file.
        (
            db.query(GeneratedFileHistory)
            .filter(GeneratedFileHistory.user_id == user.id)
            .update(
                {"owner_username": new_username},
                synchronize_session=False,
            )
        )

    if request.email is not None:
        new_email = normalize_email(request.email)

        check_unique(
            db,
            email=new_email,
            exclude_user_id=user.id,
        )

        user.email = new_email

    if request.password:
        validate_password(request.password)
        user.password_hash = pwd_context.hash(request.password)

    if request.role is not None:
        if request.role not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=400,
                detail="Role must be 'User' or 'Admin'.",
            )

        if (
            user.id == current_user.id
            and request.role != "Admin"
        ):
            raise HTTPException(
                status_code=400,
                detail="You cannot remove your own admin role.",
            )

        user.role = request.role

    db.commit()
    db.refresh(user)

    return serialize_user(user)


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = get_user_or_404(db, user_id)

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account.",
        )

    if user.role == "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be deactivated.",
        )

    # The account and its history are kept; only access is removed.
    user.is_active = False
    db.commit()

    return {
        "message": f'User "{user.username}" deactivated.',
        "id": user.id,
    }


@router.post("/users/{user_id}/reactivate")
def reactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = get_user_or_404(db, user_id)

    user.is_active = True
    db.commit()

    return {
        "message": f'User "{user.username}" reactivated.',
        "id": user.id,
    }


# =========================================================
# HISTORY OF ALL USERS
# =========================================================

@router.get("/history")
def list_all_history(
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(GeneratedFileHistory)

    if user_id is not None:
        query = query.filter(
            GeneratedFileHistory.user_id == user_id
        )

    records = (
        query.order_by(
            GeneratedFileHistory.created_at.desc()
        )
        .all()
    )

    return [
        serialize_history_record(
            record,
            record.owner_username,
        )
        for record in records
    ]