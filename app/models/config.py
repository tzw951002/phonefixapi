from pydantic import BaseModel, Field
from typing import Optional


class SiteConfigBase(BaseModel):
    hero_title: str = Field(..., example="修理のプロフェッショナル")
    hero_content: str = Field(..., example="画面割れ、バッテリー交換など\n最短15分で修理いたします。")
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    line_url: Optional[str] = None
    x_url: Optional[str] = None
    company_address: Optional[str] = None
    business_hours: Optional[str] = Field(None, example="平日：10:00 - 19:00\n土日祝：11:00 - 18:00")


class SiteConfigResponse(SiteConfigBase):
    id: int

    class Config:
        from_attributes = True
