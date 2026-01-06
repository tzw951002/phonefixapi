from pydantic import BaseModel, Field
from typing import Optional


# -----------------------------------------------------
# 基础模型 (共享字段，用于创建、读取、更新的基础)
# -----------------------------------------------------

class BatchBase(BaseModel):
    """
    批次配置的基础字段
    """
    good_name: str = Field(..., max_length=500, example="Test Good Name")
    makeshop_identifier: str = Field(..., max_length=255, example="shop_product_A123")
    kakaku_product_id: str = Field(..., max_length=255, example="kakaku_id_Z789")
    jancode: Optional[str] = Field(None, max_length=255, example="4901234567890", description="JAN代码")
    batch_type: int = Field(..., ge=1, le=255, example=1, description="批次类型 (如 1=价格更新, 2=库存同步)")
    is_enabled: bool = Field(True, example=True, description="任务开关：True=开启")
    min_price_threshold: Optional[int] = Field(None, ge=0, example=1000, description="最低价格阈值")


# -----------------------------------------------------
# 【C】创建模型 (POST 请求体)
# -----------------------------------------------------

class BatchCreate(BatchBase):
    """
    用于创建新批次配置的输入模型
    （继承 BatchBase，无需 id，is_enabled 有默认值）
    """
    pass


# -----------------------------------------------------
# 【U】更新模型 (PATCH/PUT 请求体)
# -----------------------------------------------------

class BatchUpdate(BatchBase):
    """
    用于更新现有批次配置的输入模型
    所有字段都设置为 Optional，支持部分更新 (PATCH)
    """
    good_name: Optional[str] = None
    makeshop_identifier: Optional[str] = None
    kakaku_product_id: Optional[str] = None
    jancode: Optional[str] = None
    batch_type: Optional[int] = None
    is_enabled: Optional[bool] = None
    min_price_threshold: Optional[int] = None


# -----------------------------------------------------
# 【R】读取/响应模型 (GET/POST/PUT/PATCH 响应体)
# -----------------------------------------------------

class Batch(BatchBase):
    """
    完整的批次配置模型，用于 API 响应
    """
    id: int = Field(..., example=1)  # 包含自增主键

    class Config:
        # 允许从 SQLAlchemy ORM 对象读取属性
        from_attributes = True
