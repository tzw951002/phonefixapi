from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.models import DBUser
from ..models.old import Old, OldCreate, OldUpdate # 确保 Old 是响应模型
from ..database.dependency import get_db
# 引入新的 CRUD 函数
from ..crud import (
    create_old,
    get_old,
    get_olds,
    update_old,
    delete_old,
    get_old_by_identifiers
)
from ..dependencies import get_current_user
router = APIRouter()
AUTH_DEPENDENCY = Depends(get_current_user)


# -----------------------------------------------------
# 【C】Create - 创建 Old 配置
# -----------------------------------------------------
@router.post("/create", response_model=Old, status_code=status.HTTP_201_CREATED)
def handle_create_old(old: OldCreate, db: Session = Depends(get_db), current_user: DBUser = AUTH_DEPENDENCY):
    """
    创建新的 Old 配置（旧配置）。
    """
    # 检查 makeshop_identifier 和 kakaku_product_id 组合是否已存在
    existing_old = get_old_by_identifiers(
        db,
        makeshop_id=old.makeshop_identifier,
        kakaku_id=old.kakaku_product_id
    )

    if existing_old:
        # 如果组合已存在，返回 409 Conflict 错误
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Old configuration already exists for makeshop_identifier '{old.makeshop_identifier}' and kakaku_product_id '{old.kakaku_product_id}'."
        )
    # 调用新的 CRUD 函数
    return create_old(db=db, old=old)


# -----------------------------------------------------
# 【R】Read List - 获取 Old 配置列表 (支持过滤)
# -----------------------------------------------------
@router.get("/getList", response_model=List[Old]) # 响应模型改为 List[Old]
def handle_read_olds(
        skip: int = 0,
        limit: int = 1000,
        good_name: Optional[str] = None,
        makeshop_identifier: Optional[str] = None,
        kakaku_product_id: Optional[str] = None,
        batch_type: Optional[int] = None,
        is_enabled: Optional[bool] = None,  # 布尔类型过滤
        good_status: Optional[str] = None, # 新增字段过滤
        db: Session = Depends(get_db),
        current_user: DBUser = AUTH_DEPENDENCY
):
    # 调用新的 CRUD 函数，并传递新增的过滤参数
    olds = get_olds(
        db,
        skip=skip,
        limit=limit,
        good_name=good_name,
        makeshop_id_filter=makeshop_identifier,
        kakaku_id_filter=kakaku_product_id,
        batch_type_filter=batch_type,
        is_enabled_filter=is_enabled,
        good_status_filter=good_status,
    )
    return olds


# -----------------------------------------------------
# 【U】Update - 更新单个 Old 配置
# -----------------------------------------------------
@router.patch("/{old_id}", response_model=Old) # 路径参数和响应模型改为 Old
def handle_update_old(old_id: int, old_update: OldUpdate, db: Session = Depends(get_db),
                      current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 更新 Old 配置（支持部分字段更新）。
    """
    # 调用新的 CRUD 函数
    updated_old = update_old(db, old_id=old_id, old_update=old_update)

    if updated_old is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Old configuration with ID {old_id} not found"
        )
    return updated_old


# -----------------------------------------------------
# 【D】Delete - 删除单个 Old 配置
# -----------------------------------------------------
@router.delete("/{old_id}", status_code=status.HTTP_204_NO_CONTENT) # 路径参数改为 old_id
def handle_delete_old(old_id: int, db: Session = Depends(get_db),
                      current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 删除 Old 配置。
    """
    # 调用新的 CRUD 函数
    deleted = delete_old(db, old_id=old_id)

    if not deleted:
        # 记录不存在，依然返回 404
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Old configuration with ID {old_id} not found"
        )
    # 成功删除，FastAPI 会自动返回 204 No Content
    return


# -----------------------------------------------------
# 【R】Read Single - 获取单个 Old 配置详情
# -----------------------------------------------------
@router.get("/{old_id}", response_model=Old) # 路径参数和响应模型改为 Old
def handle_read_old(old_id: int, db: Session = Depends(get_db),
                    current_user: DBUser = AUTH_DEPENDENCY):
    """
    根据 ID 获取单个 Old 配置详情。
    """
    # 调用新的 CRUD 函数
    db_old = get_old(db, old_id=old_id)

    if db_old is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Old configuration with ID {old_id} not found"
        )
    return db_old