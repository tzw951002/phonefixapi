from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database.dependency import get_db

from .. import crud
from ..database.models import DBUser
from ..dependencies import get_current_user
from ..models.news import News, NewsCreate



router = APIRouter()
@router.get("/", response_model=List[News])
async def read_all_news(db: Session = Depends(get_db)):
    """获取所有通知列表"""
    return crud.get_all_news(db)


@router.post("/", response_model=News)
async def create_new_notice(news_in: NewsCreate, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """新建通知"""
    return crud.create_news(db, news_in)


@router.put("/{news_id}", response_model=News)
async def update_notice(news_id: int, news_in: NewsCreate, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """更新通知"""
    db_news = crud.update_news(db, news_id, news_in)
    if not db_news:
        raise HTTPException(status_code=404, detail="通知が見つかりません")
    return db_news


@router.delete("/{news_id}")
async def delete_notice(news_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """删除通知"""
    crud.delete_news(db, news_id)
    return {"message": "Successfully deleted"}
