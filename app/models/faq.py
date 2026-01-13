from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# -----------------------------------------------------
# FAQ 基础模型 (共享字段)
# -----------------------------------------------------
class FAQBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: str = Field(...)
    # 必须给默认值，否则前端不传该字段时会报 422
    sort_order: int = 0
    is_visible: bool = True


# -----------------------------------------------------
# FAQ 创建模型 (用于接收 POST 请求)
# -----------------------------------------------------
class FAQCreate(FAQBase):
    """
    用于新增 FAQ 时的输入验证
    """
    pass


# -----------------------------------------------------
# FAQ 更新模型 (用于接收 PUT 请求，所有字段可选)
# -----------------------------------------------------
class FAQUpdate(BaseModel):
    """
    用于更新 FAQ 时的输入验证
    """
    title: Optional[str] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None


# -----------------------------------------------------
# FAQ 响应模型 (用于 API 返回数据)
# -----------------------------------------------------
class FAQResponse(FAQBase):
    """
    包含数据库自动生成的字段，用于前端展示
    """
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # 允许与 SQLAlchemy 对象兼容
