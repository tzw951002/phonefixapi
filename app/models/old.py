from pydantic import BaseModel, Field
from typing import Optional


# -----------------------------------------------------
# 基础模型 (共享字段，用于创建、读取、更新的基础)
# -----------------------------------------------------

class OldBase(BaseModel):
    """
    旧配置的基础字段，包含商品配置详情
    """
    # 核心字段 (Primary Info)
    good_name: str = Field(..., max_length=500, example="Test Good Name")
    makeshop_identifier: str = Field(..., max_length=255, example="shop_product_A123")
    kakaku_product_id: str = Field(..., max_length=255, example="kakaku_id_Z789")

    # 任务/控制字段 (Task/Control Info)
    batch_type: int = Field(..., ge=1, le=255, example=1, description="批次类型 (如 1=价格更新, 2=库存同步)")
    is_enabled: bool = Field(True, example=True, description="任务开关：True=开启")
    min_price_threshold: Optional[int] = Field(None, ge=0, example=1000, description="最低价格阈值")

    # 数据库新增字段 (Item Details)
    good_status: Optional[str] = Field(None, max_length=100, example="中古美品", description="商品状态描述")
    missing_info: Optional[str] = Field(None, max_length=500, example="缺少原装充电器", description="欠品情报")
    accessories_info: Optional[str] = Field(None, max_length=500, example="带说明书、原装盒", description="附属品信息")
    detail_comment: Optional[str] = Field(None, example="这是长篇详细备注...", description="详细备注或描述")
    serial_number: Optional[str] = Field(None, max_length=255, example="SN1234567890", description="制造番号 / 序列号")


# -----------------------------------------------------
# 【C】创建模型 (POST 请求体)
# -----------------------------------------------------

class OldCreate(OldBase):
    """
    用于创建新旧配置的输入模型
    """
    pass


# -----------------------------------------------------
# 【U】更新模型 (PATCH/PUT 请求体)
# -----------------------------------------------------

class OldUpdate(BaseModel):
    """
    用于更新现有旧配置的输入模型
    所有字段都设置为 Optional，支持部分更新 (PATCH)
    """
    # 核心字段
    good_name: Optional[str] = Field(None, max_length=500, example="Updated Good Name")
    makeshop_identifier: Optional[str] = Field(None, max_length=255, example="shop_product_A123")
    kakaku_product_id: Optional[str] = Field(None, max_length=255, example="kakaku_id_Z789")

    # 任务/控制字段
    batch_type: Optional[int] = Field(None, ge=1, le=255, example=2)
    is_enabled: Optional[bool] = Field(None, example=False)
    min_price_threshold: Optional[int] = Field(None, ge=0, example=2000)

    # 数据库新增字段 (Item Details)
    good_status: Optional[str] = Field(None, max_length=100)
    missing_info: Optional[str] = Field(None, max_length=500)
    accessories_info: Optional[str] = Field(None, max_length=500)
    detail_comment: Optional[str] = Field(None)
    serial_number: Optional[str] = Field(None, max_length=255)


# -----------------------------------------------------
# 【R】读取/响应模型 (GET/POST/PUT/PATCH 响应体)
# -----------------------------------------------------

class Old(OldBase):
    """
    完整的旧配置模型，用于 API 响应
    """
    id: int = Field(..., example=1)  # 包含自增主键

    class Config:
        from_attributes = True