from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from config import settings
from db import get_users_col
from auth import get_password_hash
from routes import auth, users, records, content, feedback, chat, cron

import cloudinary

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aglow_app")

# Configure Cloudinary globally
if settings.CLOUDINARY_URL:
    try:
        url = settings.CLOUDINARY_URL
        if url.startswith("cloudinary://"):
            credentials_part, cloud_name = url[13:].split("@")
            api_key, api_secret = credentials_part.split(":")
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
            logger.info("Cloudinary environment configured successfully.")
        else:
            logger.warning("CLOUDINARY_URL is invalid (does not start with cloudinary://).")
    except Exception as e:
        logger.error(f"Failed to parse CLOUDINARY_URL: {e}")
else:
    logger.warning("CLOUDINARY_URL is not set in backend settings. File uploads will fail.")

app = FastAPI(
    title="Aglow Aesthetics API",
    description="Backend API for Aglow Aesthetics Korean Aesthetic Clinic portal",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3173",
    "https://aglowaesthetics.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(records.router)
app.include_router(content.router)
app.include_router(feedback.router)
app.include_router(chat.router)
app.include_router(cron.router)

@app.on_event("startup")
def seed_admin_user():
    try:
        users_col = get_users_col()
        admin = users_col.find_one({"role": "master_admin"})
        if not admin:
            # Seed a default Master Admin
            admin_email = "admin@aglow.com"
            admin_password = "admin"
            hashed_pwd = get_password_hash(admin_password)
            
            users_col.insert_one({
                "email": admin_email,
                "name": "Head Admin Owner",
                "role": "master_admin",
                "password_hash": hashed_pwd,
                "mobile_no": "9999999999",
                "age": 30,
                "location": "Chennai",
                "client_id": "ADM001"
            })
            logger.info(f"Seeded default master admin: {admin_email} with password '{admin_password}'")
        else:
            logger.info("Master admin already exists. Seed skipped.")
    except Exception as e:
        logger.error(f"Error seeding admin user on startup: {e}")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "Aglow Aesthetics API",
        "message": "Welcome to Aglow Aesthetics Korean Skincare Clinic API Portal"
    }
