from fastapi import APIRouter, Depends, HTTPException
from rest_framework import status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.dependency import get_db

from .. import crud
from ..database.models import DBUser
from ..dependencies import get_current_user
from ..models.repair_prices import RepairPrice, RepairPriceCreate

router = APIRouter()


@router.get("/", response_model=List[RepairPrice])
async def read_prices(
        category_id: int,
        repair_type_id: int,
        db: Session = Depends(get_db)
):
    """根据分类和维修项目筛选价格列表"""
    return crud.get_prices_by_filter(db, category_id, repair_type_id)


@router.post("/", response_model=RepairPrice)
async def create_or_update_price(
        price_in: RepairPriceCreate,
        price_id: Optional[int] = None,
        db: Session = Depends(get_db)
):
    """保存价格（支持新增和修改）"""
    return crud.upsert_repair_price(db, price_in, price_id)


@router.put("/{price_id}", response_model=RepairPrice)
async def update_price(
        price_id: int,
        price_in: RepairPriceCreate,
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    """【补全】更新指定 ID 的价格记录"""
    db_price = crud.update_repair_price(db, price_id, price_in)
    if not db_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Price record not found"
        )
    return db_price


@router.delete("/{price_id}")
async def delete_price(price_id: int, db: Session = Depends(get_db)):
    crud.delete_repair_price(db, price_id)
    return {"message": "Price deleted"}


