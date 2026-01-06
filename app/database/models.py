from sqlalchemy import Column, String
from .database import Base


class DBUser(Base):
    """
    SQLAlchemy ORM 模型，映射到 'user' 表。
    """
    __tablename__ = "user"

    loginid = Column(String(20), primary_key=True, index=True)
    password = Column(String(300), nullable=False)
    token = Column(String(300), nullable=True)

    def __repr__(self):
        return f"DBUser(loginid='{self.loginid}')"
