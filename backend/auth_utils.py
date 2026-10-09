import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User


# =========================================================
# SETTINGS
# =========================================================

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "Missing JWT_SECRET_KEY in backend/.env"
    )

ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8
MIN_PASSWORD_LENGTH = 8

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

bearer_scheme = HTTPBearer(auto_error=False)


# =========================================================
# TOKENS
# =========================================================

def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


# =========================================================
# DEPENDENCIES
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated.",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = int(payload["sub"])

    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Session expired. Please log in again.",
        )

    # The role is read from the database, not the token, so a
    # change of role takes effect immediately.
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists.",
        )

    # Deactivated users lose access immediately, even with a valid token.
    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="This account has been deactivated.",
        )

    return user

def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return current_user