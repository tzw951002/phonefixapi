from pydantic import BaseModel, Field
from datetime import date, datetime


# -----------------------------------------------------
# 1. 通知一览 (News) 模型
# -----------------------------------------------------

class NewsBase(BaseModel):
    title: str = Field(..., max_length=255, example="新春キャンペーンのお知らせ")
    content: str = Field(..., example="修理代金が20%OFFになります。")
    publish_date: date = Field(..., example="2026-01-01")


class NewsCreate(NewsBase):
    """用于接收后台创建/修改请求"""
    pass


class News(NewsBase):
    """用于API响应，包含数据库自动生成的ID和时间"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
