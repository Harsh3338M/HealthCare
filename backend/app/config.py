import os
from typing import Literal

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        APP_MODE: Literal["LAB_VULNERABLE", "LAB_REMEDIATED"] = "LAB_VULNERABLE"
        DATABASE_URL: str = "sqlite:///./medivault.db"
        SECRET_KEY: str = "medivault-insecure-secret-key-12345"
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
        UPLOAD_DIR: str = "lab-data/uploads"
        BACKUP_DIR: str = "lab-data/backups"

        model_config = {
            "env_file": ".env",
            "extra": "ignore"
        }
except ImportError:
    from pydantic import BaseModel, Field

    class Settings(BaseModel):
        APP_MODE: Literal["LAB_VULNERABLE", "LAB_REMEDIATED"] = Field(
            default_factory=lambda: os.getenv("APP_MODE", "LAB_VULNERABLE")  # type: ignore[arg-type]
        )
        DATABASE_URL: str = Field(
            default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./medivault.db")
        )
        SECRET_KEY: str = Field(
            default_factory=lambda: os.getenv("SECRET_KEY", "medivault-insecure-secret-key-12345")
        )
        ALGORITHM: str = Field(
            default_factory=lambda: os.getenv("ALGORITHM", "HS256")
        )
        ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
            default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        )
        UPLOAD_DIR: str = Field(
            default_factory=lambda: os.getenv("UPLOAD_DIR", "lab-data/uploads")
        )
        BACKUP_DIR: str = Field(
            default_factory=lambda: os.getenv("BACKUP_DIR", "lab-data/backups")
        )


settings = Settings()
