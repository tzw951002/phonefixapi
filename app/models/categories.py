from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=50, example="iPhone")
    sort_order: int = Field(0, example=1)


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True
