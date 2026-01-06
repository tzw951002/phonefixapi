# models/user.py
from pydantic import BaseModel, Field
from typing import Optional


# -----------------------------------------------------
# 现有模型 (保持不变)
# -----------------------------------------------------
class User(BaseModel):
    """
    用户模型 (用于内部处理，包含密码)
    """
    loginid: str = Field(..., max_length=20, example="admin_user")
    password: str = Field(..., max_length=300)
    token: Optional[str] = Field(None, max_length=300)

    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """
    公共用户模型，用于API响应，不包含敏感信息（如密码）
    """
    loginid: str
    token: Optional[str] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------
# 【新增】登录请求体模型
# -----------------------------------------------------
class UserLogin(BaseModel):
    """
    用于接收登录请求的输入模型
    """
    loginid: str = Field(..., example="testuser")
    password: str = Field(..., example="password123")


class TokenResponse(BaseModel):
    """
    仅用于返回登录成功后的 token
    """
    token: str = Field(..., example="generated_secure_token_string")
