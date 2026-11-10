import os

SECRET_KEY = os.getenv("SECRET_KEY", "bhoominiti-enterprise-secret-key-2026-secure-jwt-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
