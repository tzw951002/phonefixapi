from sqlalchemy import Column, String, Integer, Text, Date, DateTime, ForeignKey, Numeric, Boolean, func
from sqlalchemy.orm import relationship
from .database import Base


class DBUser(Base):
    __tablename__ = "user"
    loginid = Column(String(20), primary_key=True, index=True)
    password = Column(String(300), nullable=False)
    token = Column(String(300), nullable=True)

    def __repr__(self):
        return f"DBUser(loginid='{self.loginid}')"


class DBNews(Base):
    __tablename__ = "news"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    publish_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"DBNews(id={self.id}, title='{self.title}')"


# -----------------------------------------------------
# 【补全】机种分类表 (如：iPhone, Android)
# -----------------------------------------------------
class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # 建立反向关联，方便查询该分类下所有的价格记录
    prices = relationship("DBRepairPrice", back_populates="category")


# -----------------------------------------------------
# 【补全】维修种类表 (如：液晶修理, バッテリー交換)
# -----------------------------------------------------
class DBRepairType(Base):
    __tablename__ = "repair_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # 建立反向关联
    prices = relationship("DBRepairPrice", back_populates="repair_type")


# -----------------------------------------------------
# 【补全】具体维修价格表 (核心数据表)
# -----------------------------------------------------
class DBRepairPrice(Base):
    __tablename__ = "repair_prices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    repair_type_id = Column(Integer, ForeignKey("repair_types.id", ondelete="CASCADE"), nullable=False)

    model_name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    price_suffix = Column(String(20), default="税込")
    is_visible = Column(Boolean, default=True)

    # --- 新增字段 ---
    sort_order = Column(Integer, default=0, nullable=False) # 权重值，越大越靠前
    # ----------------

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("DBCategory", back_populates="prices")
    repair_type = relationship("DBRepairType", back_populates="prices")

    def __repr__(self):
        return f"<DBRepairPrice(model='{self.model_name}', sort={self.sort_order})>"
