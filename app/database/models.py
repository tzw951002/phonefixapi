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
    sort_order = Column(Integer, default=0, nullable=False)  # 权重值，越大越靠前
    # ----------------

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("DBCategory", back_populates="prices")
    repair_type = relationship("DBRepairType", back_populates="prices")

    def __repr__(self):
        return f"<DBRepairPrice(model='{self.model_name}', sort={self.sort_order})>"


class DBFaq(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)  # 对应 SQL 中的 text
    content = Column(Text, nullable=False)  # 对应 SQL 中的 text
    sort_order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)  # SQL 中 tinyint(1) 对应 Boolean
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<DBFaq(id={self.id}, title='{self.title[:20]}...', sort={self.sort_order})>"


class DBSiteConfig(Base):
    __tablename__ = "site_configs"

    # 固定为 1 的主键，因为全站只有一份配置
    id = Column(Integer, primary_key=True, default=1)

    # HERO 模块
    hero_title = Column(Text, nullable=False)  # HERO大标题
    hero_content = Column(Text, nullable=False)  # HERO内容描述（支持换行）
    hero_image_url = Column(String(500))  # HERO背景图链接
    hero_video_url = Column(String(500))  # HERO视频链接

    # 社交媒体
    line_url = Column(String(500))  # LINE链接
    x_url = Column(String(500))  # X (Twitter) 链接

    # 公司信息
    company_address = Column(Text)  # 公司地址
    business_hours = Column(Text)  # 营业时间（支持换行）

    def __repr__(self):
        return f"<DBSiteConfig(id={self.id}, hero_title='{self.hero_title[:15]}...')>"
