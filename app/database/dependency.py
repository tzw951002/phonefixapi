from .database import SessionLocal
from sqlalchemy.orm import Session
from typing import Generator


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI 依赖函数。
    在每个请求开始时创建会话 (Session)，在请求结束时关闭会话。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
