# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from .database.models import DBUser
from typing import Optional


# -----------------------------------------------------
# 用户查询操作
# -----------------------------------------------------
def get_user_by_loginid(db: Session, login_id: str) -> Optional[DBUser]:
    """
    根据 login_id 从数据库查询单个用户记录。
    """
    return db.get(DBUser, login_id)


# -----------------------------------------------------
# 更新token写入操作
# -----------------------------------------------------
def update_user_token(db: Session, user: DBUser, new_token: str) -> DBUser:
    """
    更新用户的 token 字段并提交到数据库。
    """
    user.token = new_token
    db.add(user)
    db.commit()  # 提交事务
    db.refresh(user)  # 刷新对象以获取最新的数据库状态
    return user


def get_user_by_token(db: Session, token: str) -> Optional[DBUser]:
    """
    根据 token 从数据库查询单个用户记录。
    """
    # 查找 DBUser 表中 token 字段匹配的记录
    stmt = select(DBUser).where(DBUser.token == token)
    return db.scalars(stmt).first()
