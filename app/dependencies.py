from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from .database.dependency import get_db
from .crud import get_user_by_token
from .database.models import DBUser  # 导入 DBUser 用于类型提示

# 定义 OAuth2 方案，用于从请求头中提取 Token
# auto_error=False 允许我们手动处理错误响应
oauth2_scheme = HTTPBearer(auto_error=False)


def get_current_user(
        db: Session = Depends(get_db),
        # 依赖 HTTPBearer 提取 Authorization: Bearer <token>
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)
) -> DBUser:
    """
    FastAPI 依赖函数：验证请求头中的 Token 并返回 DBUser 对象。
    如果验证失败，抛出 401 Unauthorized 异常。
    """
    # 1. 检查凭证是否存在
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing or format is incorrect (should be 'Bearer <token>')",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials  # 提取 Bearer 后面的实际 Token 字符串

    # 2. 检查 Token 是否存在于数据库
    user = get_user_by_token(db, token=token)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. 验证成功，返回用户对象
    return user
