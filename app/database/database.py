# database/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# ⚠️ 1. 配置数据库 URL
# 格式: mysql+pymysql://<user>:<password>@<host>:<port>/<database>
DATABASE_URL = "mysql+pymysql://root:laotao13CV@localhost:3306/phonefix"

# 2. 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# 3. 创建 SessionLocal 类
# 每次数据库操作都将使用这个 SessionLocal 实例
SessionLocal = sessionmaker(
    autocommit=False,  # 不自动提交，需要手动调用 session.commit()
    autoflush=False,  # 不自动刷新
    bind=engine
)

# 4. 创建基类
# ORM 模型将继承这个基类
Base = declarative_base()


# 辅助函数: 初始化数据库和创建表
def init_db():
    """在应用启动时调用，如果表不存在则创建。"""
    # 导入所有 ORM 模型（例如 models/db_models.py）以确保它们注册到 Base.metadata
    from .models import DBUser  # 假设你将 ORM 模型放在 database/models.py 中

    # 根据 Base.metadata 中的定义创建所有表
    Base.metadata.create_all(bind=engine)
