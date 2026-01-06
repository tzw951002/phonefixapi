# utils/auth.py
import secrets
import string


# ⚠️ 实际项目中，请使用安全的密码哈希库，例如 passlib

def generate_token(length: int = 32) -> str:
    """
    生成一个安全的随机 Token
    """
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(length))
    return token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码 (⚠️ 仅作演示，实际应用中请使用哈希验证)
    """
    # 假设你的数据库中存储的是明文密码（极度不推荐）或直接比较
    # 生产环境中应是: return bcrypt.verify(plain_password, hashed_password)
    return plain_password == hashed_password
