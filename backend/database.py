from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote_plus


DB_USER = "postgres"
DB_PASSWORD = "ashir@123"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "gis_metadata"

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:"
    f"{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()