from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database.dependency import get_db

from .. import crud
from ..database.models import DBUser, DBFaq
from ..dependencies import get_current_user
from ..models.faq import FAQResponse, FAQCreate  # 确保导入了对应的模型

router = APIRouter()


@router.get("/", response_model=List[FAQResponse])
async def read_faqs(db: Session = Depends(get_db)):
    """
    获取所有 FAQ 列表（按权重排序）
    """
    return crud.get_all_faqs(db)


@router.post("/", response_model=FAQResponse)
async def create_new_faq(
        faq_in: FAQCreate,  # FastAPI 会自动将 Request Body 映射到这里
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    return crud.create_faq(db, faq_in)


@router.put("/{faq_id}", response_model=FAQResponse)
async def update_faq(
        faq_id: int,
        faq_in: FAQCreate,
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    """
    更新指定 ID 的 FAQ（用于编辑内容或调整排序权重）
    """
    db_faq = crud.update_faq(db, faq_id, faq_in)
    if not db_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ not found"
        )
    return db_faq


@router.delete("/{faq_id}")
async def delete_faq(
        faq_id: int,
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    """
    删除指定 ID 的 FAQ
    """
    # 1. 直接获取数据库对象进行检查
    db_faq = db.get(DBFaq, faq_id)
    if not db_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ not found"
        )

    # 2. 执行删除
    crud.delete_faq(db, faq_id)
    return {"message": "FAQ deleted successfully"}