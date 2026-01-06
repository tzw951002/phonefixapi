from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.models import DBUser
from ..models.batch import Batch, BatchCreate, BatchUpdate
from ..database.dependency import get_db
from ..crud import (
    create_batch,
    get_batch,
    get_batches,
    update_batch,
    delete_batch,
    get_batch_by_identifiers
)
from ..dependencies import get_current_user
router = APIRouter()
AUTH_DEPENDENCY = Depends(get_current_user)


@router.post("/create", response_model=Batch, status_code=status.HTTP_201_CREATED)
def handle_create_batch(batch: BatchCreate, db: Session = Depends(get_db), current_user: DBUser = AUTH_DEPENDENCY):
    """
    创建新的批次配置。
    """
    existing_batch = get_batch_by_identifiers(
        db,
        makeshop_id=batch.makeshop_identifier,
        kakaku_id=batch.kakaku_product_id
    )

    if existing_batch:
        # 如果组合已存在，返回 409 Conflict 错误
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Batch configuration already exists for makeshop_identifier '{batch.makeshop_identifier}' and kakaku_product_id '{batch.kakaku_product_id}'."
        )
    return create_batch(db=db, batch=batch)


@router.get("/getList", response_model=List[Batch])
def handle_read_batches(
        skip: int = 0,
        limit: int = 1000,
        good_name: Optional[str] = None,
        makeshop_identifier: Optional[str] = None,
        kakaku_product_id: Optional[str] = None,
        batch_type: Optional[int] = None,
        is_enabled: Optional[bool] = None,  # 布尔类型过滤
        db: Session = Depends(get_db),
        current_user: DBUser = AUTH_DEPENDENCY
):
    batches = get_batches(
        db,
        skip=skip,
        limit=limit,
        good_name=good_name,
        makeshop_id_filter=makeshop_identifier,
        kakaku_id_filter=kakaku_product_id,
        batch_type_filter=batch_type,
        is_enabled_filter=is_enabled,
    )
    return batches


@router.patch("/{batch_id}", response_model=Batch)
def handle_update_batch(batch_id: int, batch_update: BatchUpdate, db: Session = Depends(get_db),
                        current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 更新批次配置（支持部分字段更新）。
    """
    updated_batch = update_batch(db, batch_id=batch_id, batch_update=batch_update)

    if updated_batch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch configuration with ID {batch_id} not found"
        )
    return updated_batch


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def handle_delete_batch(batch_id: int, db: Session = Depends(get_db),
                        current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 删除批次配置。
    """
    deleted = delete_batch(db, batch_id=batch_id)

    if not deleted:
        # 记录不存在，依然返回 404
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch configuration with ID {batch_id} not found"
        )
    # 成功删除，FastAPI 会自动返回 204 No Content
    return


@router.get("/{batch_id}", response_model=Batch)
def handle_read_batch(batch_id: int, db: Session = Depends(get_db),
                      current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 获取单个批次配置详情。
    """
    db_batch = get_batch(db, batch_id=batch_id)

    if db_batch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch configuration with ID {batch_id} not found"
        )
    return db_batch
