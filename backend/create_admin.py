import getpass
import sys

from backend.auth_utils import MIN_PASSWORD_LENGTH, pwd_context
from backend.database import Base, SessionLocal, engine
from backend.models import User


def main():
    if len(sys.argv) != 2:
        print("Usage: python -m backend.create_admin <username>")
        sys.exit(1)

    username = sys.argv[1].strip()

    if not username:
        print("Username cannot be empty.")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)

    password = getpass.getpass("Password: ")

    if len(password) < MIN_PASSWORD_LENGTH:
        print(
            "Password must be at least "
            f"{MIN_PASSWORD_LENGTH} characters."
        )
        sys.exit(1)

    if getpass.getpass("Confirm password: ") != password:
        print("Passwords do not match.")
        sys.exit(1)

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if user is None:
            db.add(
                User(
                    username=username,
                    password_hash=pwd_context.hash(password),
                    role="Admin",
                )
            )
            message = f'Admin "{username}" created.'

        else:
            user.role = "Admin"
            user.password_hash = pwd_context.hash(password)
            message = (
                f'Existing user "{username}" promoted to '
                "Admin and password updated."
            )

        db.commit()
        print(message)

    finally:
        db.close()


if __name__ == "__main__":
    main()