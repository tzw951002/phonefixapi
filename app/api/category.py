from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database.dependency import get_db

from .. import crud
from ..database.models import DBUser
from ..dependencies import get_current_user
from ..models.categories import Category, CategoryCreate
from ..models.repair_types import RepairType, RepairTypeCreate

router = APIRouter()


# --- 一级分类 (Category) ---

@router.get("/", response_model=List[Category])
async def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.post("/", response_model=Category)
async def add_category(cat_in: CategoryCreate, db: Session = Depends(get_db),
                       current_user: DBUser = Depends(get_current_user)):
    return crud.create_category(db, cat_in)


@router.put("/{cat_id}", response_model=Category)
async def update_category(cat_id: int, cat_in: CategoryCreate, db: Session = Depends(get_db),
                          current_user: DBUser = Depends(get_current_user)):
    db_cat = crud.update_category(db, cat_id, cat_in)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_cat


@router.delete("/{cat_id}")
async def delete_category(cat_id: int, db: Session = Depends(get_db),
                          current_user: DBUser = Depends(get_current_user)):
    """【补全】删除一级分类"""
    success = crud.delete_category(db, cat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}


# --- 二级维修项目 (RepairType) ---

@router.get("/repair-types", response_model=List[RepairType])
async def get_repair_types(db: Session = Depends(get_db)):
    return crud.get_repair_types(db)


@router.post("/repair-types", response_model=RepairType)
async def add_repair_type(rt_in: RepairTypeCreate, db: Session = Depends(get_db),
                          current_user: DBUser = Depends(get_current_user)):
    return crud.create_repair_type(db, rt_in)


@router.put("/repair-types/{rt_id}", response_model=RepairType)
async def update_repair_type(rt_id: int, rt_in: RepairTypeCreate, db: Session = Depends(get_db),
                             current_user: DBUser = Depends(get_current_user)):
    db_rt = crud.update_repair_type(db, rt_id, rt_in)
    if not db_rt:
        raise HTTPException(status_code=404, detail="Repair type not found")
    return db_rt


@router.delete("/repair-types/{rt_id}")
async def delete_repair_type(rt_id: int, db: Session = Depends(get_db),
                             current_user: DBUser = Depends(get_current_user)):
    """【补全】删除二级维修项目"""
    success = crud.delete_repair_type(db, rt_id)
    if not success:
        raise HTTPException(status_code=404, detail="Repair type not found")
    return {"message": "Repair type deleted successfully"}


