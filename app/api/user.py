from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import  UserLogin, TokenResponse
from ..database.dependency import get_db
from ..crud import get_user_by_loginid, update_user_token
from ..utils.auth import generate_token, verify_password

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login_for_token(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    根据 login_id 查询用户详情（排除密码）。
    """
    # 1. 调用数据库 CRUD 函数获取用户数据
    # 假设 user_crud.get_user 返回一个数据库 ORM 对象
    db_user = get_user_by_loginid(db, login_id=user_credentials.loginid)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(user_credentials.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_token = generate_token(length=64)

    updated_user = update_user_token(db, db_user, new_token)

    return {"token": updated_user.token}
