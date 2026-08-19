import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "aglow_aesthetics"
    JWT_SECRET: str = "supersecretgoldstandardkoreanbeautybrandkey123!!!"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Aglow Aesthetics <onboarding@resend.dev>"
    CLOUDINARY_URL: str = ""
    
    # We allow these to be set as fallbacks if the DB doesn't have them yet
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
