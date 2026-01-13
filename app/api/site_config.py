from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.dependency import get_db
from .. import crud
from ..models.config import SiteConfigResponse, SiteConfigBase

router = APIRouter()


@router.get("/", response_model=SiteConfigResponse)
def read_config(db: Session = Depends(get_db)):
    return crud.get_site_config(db)


@router.put("/", response_model=SiteConfigResponse)
def update_config(config_in: SiteConfigBase, db: Session = Depends(get_db)):
    # 可以在这里加上 get_current_user 权限校验
    return crud.update_site_config(db, config_in)
