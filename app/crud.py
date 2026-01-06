# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from .database.models import DBUser
from .database.models import DBBatch
from .database.models import DBOld
from typing import Optional, Type, List
from .models.batch import BatchCreate, BatchUpdate
from .models.old import OldCreate, OldUpdate
from sqlalchemy.sql.expression import and_


# -----------------------------------------------------
# 用户查询操作
# -----------------------------------------------------
def get_user_by_loginid(db: Session, login_id: str) -> Optional[DBUser]:
    """
    根据 login_id 从数据库查询单个用户记录。
    """
    return db.get(DBUser, login_id)


# -----------------------------------------------------
# 更新token写入操作
# -----------------------------------------------------
def update_user_token(db: Session, user: DBUser, new_token: str) -> DBUser:
    """
    更新用户的 token 字段并提交到数据库。
    """
    user.token = new_token
    db.add(user)
    db.commit()  # 提交事务
    db.refresh(user)  # 刷新对象以获取最新的数据库状态
    return user


# -----------------------------------------------------
# 【C】Create - 创建批次配置
# -----------------------------------------------------
def create_batch(db: Session, batch: BatchCreate) -> DBBatch:
    """
    创建新的批次配置记录。

    参数:
        db: 数据库会话
        batch: 包含新配置数据的 Pydantic BatchCreate 模型

    返回:
        新创建的 DBBatch ORM 对象
    """
    # **kwargs 是将 Pydantic 模型的字段解包为关键字参数
    db_batch = DBBatch(**batch.model_dump())

    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)  # 刷新对象以获取数据库生成的 id
    return db_batch


# -----------------------------------------------------
# 【R】Read - 读取批次配置
# -----------------------------------------------------

# 1. 根据 ID 读取单个配置
def get_batch(db: Session, batch_id: int) -> Optional[DBBatch]:
    """
    根据 ID 查询单个批次配置。
    使用 Session.get()，因为 ID 是主键，效率最高。
    """
    return db.get(DBBatch, batch_id)


# 2. 读取所有配置 (分页)
def get_batches(db: Session,
                skip: int = 0,
                limit: int = 1000,
                good_name: Optional[str] = None,
                # 接收过滤参数
                makeshop_id_filter: Optional[str] = None,
                kakaku_id_filter: Optional[str] = None,
                batch_type_filter: Optional[int] = None,
                is_enabled_filter: Optional[bool] = None) -> List[DBBatch]:
    stmt = select(DBBatch)
    conditions = []
    if good_name:
        conditions.append(DBBatch.good_name.like(f"%{good_name}%"))

    if makeshop_id_filter:
        conditions.append(DBBatch.makeshop_identifier.like(f"%{makeshop_id_filter}%"))

    if kakaku_id_filter:
        conditions.append(DBBatch.kakaku_product_id.like(f"%{kakaku_id_filter}%"))

    if batch_type_filter is not None:
        conditions.append(DBBatch.batch_type == batch_type_filter)

    if is_enabled_filter is not None:
        conditions.append(DBBatch.is_enabled == is_enabled_filter)

    if conditions:
        # 使用 and_() 函数将所有条件以 AND 逻辑组合
        stmt = stmt.where(and_(*conditions))
    """
    分页查询批次配置列表。
    """
    stmt = stmt.order_by(DBBatch.id)
    # 采用 SQLAlchemy 2.0 风格的 select 语句
    stmt = stmt.offset(skip).limit(limit)
    return db.scalars(stmt).all()


# -----------------------------------------------------
# 【U】Update - 更新批次配置
# -----------------------------------------------------
def update_batch(db: Session, batch_id: int, batch_update: BatchUpdate) -> Type[DBBatch] | None:
    """
    更新现有批次配置。

    参数:
        db: 数据库会话
        batch_id: 要更新的记录ID
        batch_update: 包含要更新字段的 Pydantic BatchUpdate 模型

    返回:
        更新后的 DBBatch ORM 对象，如果记录不存在则返回 None。
    """
    # 查找要更新的记录
    db_batch = db.get(DBBatch, batch_id)

    if not db_batch:
        return None

    # 获取 Pydantic 模型中非 None 的字段值
    update_data = batch_update.model_dump(exclude_unset=True)

    # 将更新数据应用到 ORM 对象上
    for key, value in update_data.items():
        setattr(db_batch, key, value)

    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch


# -----------------------------------------------------
# 【D】Delete - 删除批次配置
# -----------------------------------------------------
def delete_batch(db: Session, batch_id: int) -> bool:
    """
    根据 ID 删除批次配置。

    参数:
        db: 数据库会话
        batch_id: 要删除的记录ID

    返回:
        如果删除成功返回 True，否则返回 False。
    """
    # 查找要删除的记录
    db_batch = db.get(DBBatch, batch_id)

    if not db_batch:
        return False

    db.delete(db_batch)
    db.commit()
    return True


def get_batch_by_identifiers(db: Session, makeshop_id: str, kakaku_id: str) -> Optional[DBBatch]:
    """
    根据 makeshop_identifier 和 kakaku_product_id 组合查询批次配置。
    """
    stmt = select(DBBatch).where(
        and_(
            DBBatch.makeshop_identifier == makeshop_id,
            DBBatch.kakaku_product_id == kakaku_id
        )
    )
    return db.scalars(stmt).first()


def get_user_by_token(db: Session, token: str) -> Optional[DBUser]:
    """
    根据 token 从数据库查询单个用户记录。
    """
    # 查找 DBUser 表中 token 字段匹配的记录
    stmt = select(DBUser).where(DBUser.token == token)
    return db.scalars(stmt).first()


def create_old(db: Session, old: OldCreate) -> DBOld:
    """
    创建新的 Old 配置记录。

    参数:
        db: 数据库会话
        old: 包含新配置数据的 Pydantic OldCreate 模型

    返回:
        新创建的 DBOld ORM 对象
    """
    # **kwargs 是将 Pydantic 模型的字段解包为关键字参数
    db_old = DBOld(**old.model_dump())

    db.add(db_old)
    db.commit()
    db.refresh(db_old)  # 刷新对象以获取数据库生成的 id
    return db_old


# 1. 根据 ID 读取单个配置
def get_old(db: Session, old_id: int) -> Optional[DBOld]:
    """
    根据 ID 查询单个 Old 配置。
    """
    return db.get(DBOld, old_id)


# 2. 读取所有配置 (分页)
def get_olds(db: Session,
             skip: int = 0,
             limit: int = 1000,
             good_name: Optional[str] = None,
             # 接收过滤参数
             makeshop_id_filter: Optional[str] = None,
             kakaku_id_filter: Optional[str] = None,
             batch_type_filter: Optional[int] = None,
             is_enabled_filter: Optional[bool] = None,
             # 针对新增字段的过滤（示例）
             good_status_filter: Optional[str] = None) -> List[DBOld]:
    stmt = select(DBOld)
    conditions = []

    # 过滤条件
    if good_name:
        conditions.append(DBOld.good_name.like(f"%{good_name}%"))
    if makeshop_id_filter:
        conditions.append(DBOld.makeshop_identifier.like(f"%{makeshop_id_filter}%"))
    if kakaku_id_filter:
        conditions.append(DBOld.kakaku_product_id.like(f"%{kakaku_id_filter}%"))
    if batch_type_filter is not None:
        conditions.append(DBOld.batch_type == batch_type_filter)
    if is_enabled_filter is not None:
        conditions.append(DBOld.is_enabled == is_enabled_filter)

    # 新增字段的精确匹配过滤
    if good_status_filter:
        conditions.append(DBOld.good_status == good_status_filter)

    if conditions:
        # 使用 and_() 函数将所有条件以 AND 逻辑组合
        stmt = stmt.where(and_(*conditions))

    """
    分页查询 Old 配置列表。
    """
    stmt = stmt.order_by(DBOld.id)
    # 采用 SQLAlchemy 2.0 风格的 select 语句
    stmt = stmt.offset(skip).limit(limit)
    return db.scalars(stmt).all()


# -----------------------------------------------------
# 【U】Update - 更新 Old 配置
# -----------------------------------------------------
def update_old(db: Session, old_id: int, old_update: OldUpdate) -> Type[DBOld] | None:
    """
    更新现有 Old 配置。

    参数:
        db: 数据库会话
        old_id: 要更新的记录ID
        old_update: 包含要更新字段的 Pydantic OldUpdate 模型

    返回:
        更新后的 DBOld ORM 对象，如果记录不存在则返回 None。
    """
    # 查找要更新的记录
    db_old = db.get(DBOld, old_id)

    if not db_old:
        return None

    # 获取 Pydantic 模型中非 None 的字段值
    update_data = old_update.model_dump(exclude_unset=True)

    # 将更新数据应用到 ORM 对象上
    for key, value in update_data.items():
        setattr(db_old, key, value)

    db.add(db_old)
    db.commit()
    db.refresh(db_old)
    return db_old


# -----------------------------------------------------
# 【D】Delete - 删除 Old 配置
# -----------------------------------------------------
def delete_old(db: Session, old_id: int) -> bool:
    """
    根据 ID 删除 Old 配置。

    参数:
        db: 数据库会话
        old_id: 要删除的记录ID

    返回:
        如果删除成功返回 True，否则返回 False。
    """
    # 查找要删除的记录
    db_old = db.get(DBOld, old_id)

    if not db_old:
        return False

    db.delete(db_old)
    db.commit()
    return True


def get_old_by_identifiers(db: Session, makeshop_id: str, kakaku_id: str) -> Optional[DBOld]:
    """
    根据 makeshop_identifier 和 kakaku_product_id 组合查询 Old 配置。
    """
    stmt = select(DBOld).where(
        and_(
            DBOld.makeshop_identifier == makeshop_id,
            DBOld.kakaku_product_id == kakaku_id
        )
    )
    return db.scalars(stmt).first()
