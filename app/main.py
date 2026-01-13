from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 导入 CORS 中间件
from app.api import user, news, price, category, faq, site_config


app = FastAPI()

# --- 🎯 解决 CORS 问题的关键代码块 ---

# 定义允许的来源列表
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # 允许的来源列表
    allow_credentials=True,         # 允许携带凭证（如 Authorization header, cookies）
    allow_methods=["*"],            # 允许所有 HTTP 方法 (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],            # 允许所有 HTTP 头
)

# ----------------------------------------
# 现有路由保持不变

# ❗ 注意: 您之前的日志是 `/users/login`，
#    但您的 prefix 是 `/user`，如果前端使用 `/users`，请确保这里匹配。
#    如果前端确实是 `/users`，您可能需要将 prefix 改为 `/users`
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(category.router, prefix="/categories", tags=["categories"])
app.include_router(price.router, prefix="/prices", tags=["prices"])
app.include_router(faq.router, prefix="/faq", tags=["faq"])
app.include_router(site_config.router, prefix="/config", tags=["config"])


