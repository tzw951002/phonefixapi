from sqlalchemy.orm import Session
from sqlalchemy import select, delete, update

from app.models.categories import CategoryCreate
from app.models.news import NewsCreate
from app.models.repair_prices import RepairPriceCreate
from app.models.repair_types import RepairTypeCreate
from .database.models import DBUser, DBNews, DBCategory, DBRepairType, DBRepairPrice
from typing import Optional, List
import datetime


# -----------------------------------------------------
# 用户操作 (保持不变)
# -----------------------------------------------------
def get_user_by_loginid(db: Session, login_id: str) -> Optional[DBUser]:
    return db.get(DBUser, login_id)


def update_user_token(db: Session, user: DBUser, new_token: str) -> DBUser:
    user.token = new_token
    db.commit()
    db.refresh(user)
    return user


def get_user_by_token(db: Session, token: str) -> Optional[DBUser]:
    stmt = select(DBUser).where(DBUser.token == token)
    return db.scalars(stmt).first()


# -----------------------------------------------------
# 1. 通知一览操作 (NewsManager 画面使用)
# -----------------------------------------------------
def get_all_news(db: Session) -> List[DBNews]:
    # 按发布日期倒序排列，最新的在前面
    stmt = select(DBNews).order_by(DBNews.publish_date.desc())
    return db.scalars(stmt).all()


def create_news(db: Session, news_in: NewsCreate) -> DBNews:
    db_news = DBNews(**news_in.model_dump())
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news


def delete_news(db: Session, news_id: int):
    stmt = delete(DBNews).where(DBNews.id == news_id)
    db.execute(stmt)
    db.commit()


# -----------------------------------------------------
# 2. 机种分类操作 (CategoryManager 画面 - 上半部分)
# -----------------------------------------------------
def get_categories(db: Session) -> List[DBCategory]:
    stmt = select(DBCategory).order_by(DBCategory.sort_order.asc())
    return db.scalars(stmt).all()


def create_category(db: Session, cat_in: CategoryCreate) -> DBCategory:
    db_cat = DBCategory(**cat_in.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def delete_category(db: Session, cat_id: int):
    db.execute(delete(DBCategory).where(DBCategory.id == cat_id))
    db.commit()


# -----------------------------------------------------
# 3. 维修种类操作 (CategoryManager 画面 - 下半部分)
# -----------------------------------------------------
def get_repair_types(db: Session) -> List[DBRepairType]:
    stmt = select(DBRepairType).order_by(DBRepairType.sort_order.asc())
    return db.scalars(stmt).all()


def create_repair_type(db: Session, rt_in: RepairTypeCreate) -> DBRepairType:
    db_rt = DBRepairType(**rt_in.model_dump())
    db.add(db_rt)
    db.commit()
    db.refresh(db_rt)
    return db_rt


# -----------------------------------------------------
# 4. 维修价格操作 (PriceManager 画面使用)
# -----------------------------------------------------
def get_prices_by_filter(db: Session, category_id: int, repair_type_id: int) -> List[DBRepairPrice]:
    """
    对应 PriceManager 顶部的联动筛选功能
    修改点：将原有的按价格降序改为先按 sort_order 降序，再按 id 降序
    """
    stmt = (
        select(DBRepairPrice)
        .where(
            DBRepairPrice.category_id == category_id,
            DBRepairPrice.repair_type_id == repair_type_id
        )
        # 排序逻辑：权重大的在前，同权重下最新的在前
        .order_by(DBRepairPrice.sort_order.desc(), DBRepairPrice.id.desc())
    )
    return db.scalars(stmt).all()


def upsert_repair_price(db: Session, price_in: RepairPriceCreate, price_id: Optional[int] = None) -> DBRepairPrice:
    """
    新增或更新价格记录（支持 sort_order）
    """
    # 将模型转为字典
    price_data = price_in.model_dump()

    if price_id:
        # 更新逻辑
        stmt = update(DBRepairPrice).where(DBRepairPrice.id == price_id).values(**price_data)
        db.execute(stmt)
        db.commit()
        return db.get(DBRepairPrice, price_id)
    else:
        # 新增逻辑
        db_price = DBRepairPrice(**price_data)
        db.add(db_price)
        db.commit()
        db.refresh(db_price)
        return db_price


def delete_repair_price(db: Session, price_id: int):
    db.execute(delete(DBRepairPrice).where(DBRepairPrice.id == price_id))
    db.commit()


# -----------------------------------------------------
# 1. 更新通知 (News)
# -----------------------------------------------------
def update_news(db: Session, news_id: int, news_in: NewsCreate) -> DBNews:
    db_news = db.get(DBNews, news_id)
    if db_news:
        # 将 NewsCreate 模型转为字典并更新到数据库对象
        update_data = news_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_news, key, value)

        db.commit()
        db.refresh(db_news)
    return db_news


# -----------------------------------------------------
# 2. 更新机种分类 (Category)
# -----------------------------------------------------
def update_category(db: Session, cat_id: int, cat_in: CategoryCreate) -> DBCategory:
    db_cat = db.get(DBCategory, cat_id)
    if db_cat:
        update_data = cat_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_cat, key, value)

        db.commit()
        db.refresh(db_cat)
    return db_cat


# -----------------------------------------------------
# 3. 更新维修种类 (RepairType)
# -----------------------------------------------------
def update_repair_type(db: Session, rt_id: int, rt_in: RepairTypeCreate) -> DBRepairType:
    db_rt = db.get(DBRepairType, rt_id)
    if db_rt:
        update_data = rt_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_rt, key, value)

        db.commit()
        db.refresh(db_rt)
    return db_rt


# -----------------------------------------------------
# 4. 更新维修价格 (RepairPrice)
# -----------------------------------------------------
def update_repair_price(db: Session, price_id: int, price_in: RepairPriceCreate) -> DBRepairPrice:
    """
    显式更新维修价格（支持 sort_order）
    """
    db_price = db.get(DBRepairPrice, price_id)
    if db_price:
        # exclude_unset=True 确保只更新请求中存在的字段（如只更新排序权重）
        update_data = price_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_price, key, value)

        # SQLAlchemy 的 onupdate=func.now() 会自动处理时间，
        # 但如果想手动强制刷新 updated_at，保留此行：
        db_price.updated_at = datetime.datetime.now()

        db.commit()
        db.refresh(db_price)
    return db_price
