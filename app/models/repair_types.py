from pydantic import BaseModel, Field


class RepairTypeBase(BaseModel):
    name: str = Field(..., max_length=50, example="液晶修理(軽度)")
    sort_order: int = Field(0, example=1)


class RepairTypeCreate(RepairTypeBase):
    pass


class RepairType(RepairTypeBase):
    id: int

    class Config:
        from_attributes = True
