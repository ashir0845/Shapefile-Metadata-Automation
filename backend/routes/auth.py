from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.auth_utils import (
    MIN_PASSWORD_LENGTH,
    create_access_token,
    get_current_user,
    pwd_context,
)
from backend.database import get_db
from backend.models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class LoginRequest(BaseModel):
    # Accepts either the username or the email address.
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# =========================================================
# LOGIN (username or email)
# =========================================================

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    identifier = request.username.strip()

    user = (
        db.query(User)
        .filter(
            or_(
                User.username == identifier,
                func.lower(User.email) == identifier.lower(),
            )
        )
        .first()
    )

    if user is None or not pwd_context.verify(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been deactivated. "
                "Please contact an administrator."
            ),
        )

    return {
        "message": "Login successful",
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
    }


# =========================================================
# CHANGE PASSWORD (any logged-in user)
# =========================================================

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not pwd_context.verify(
        request.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    if len(request.new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be at least "
                f"{MIN_PASSWORD_LENGTH} characters."
            ),
        )

    if request.new_password == request.current_password:
        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different "
                "from the current password."
            ),
        )

    current_user.password_hash = pwd_context.hash(
        request.new_password
    )
    db.commit()

    return {
        "message": "Password changed successfully."
    }