from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

from app.models.categories import Category
from app.models.repair_types import RepairType


class RepairPriceBase(BaseModel):
    category_id: int = Field(..., example=1)
    repair_type_id: int = Field(..., example=1)
    model_name: str = Field(..., max_length=100, example="iPhone 15 Pro")
    price: float = Field(..., example=24800.0)
    price_suffix: str = Field("税込", max_length=20, example="税込")
    is_visible: bool = Field(True, example=True)


class RepairPriceCreate(RepairPriceBase):
    """用于接收创建价格的请求"""
    pass


class RepairPrice(RepairPriceBase):
    """用于API响应"""
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class PriceListResponse(BaseModel):
    categories: List[Category]
    repair_types: List[RepairType]
    prices: List[RepairPrice]
