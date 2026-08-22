from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import datetime

from config import settings
from db import (
    get_users_col,
    get_services_col,
    get_offers_col,
    get_locations_col,
    get_testimonials_col,
    get_about_col
)
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
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3173",
    "http://127.0.0.1:8080",
    "https://aglowaesthetics.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
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

@app.on_event("startup")
def seed_initial_content():
    try:
        # 1. Seed About
        about_col = get_about_col()
        if about_col.count_documents({}) == 0:
            about_col.insert_one({
                "intro": "Chennai's First Ever Korean Aesthetics",
                "tagline": "Transforming skin, beauty and wellness with authentic Korean care",
                "paragraphs": [
                    "At Aglow Aesthetics, located in the heart of Puzhuthivakkam, Chennai, we bring you the secrets of flawless, glass-skin beauty straight from South Korea. As Chennai's First Ever Korean Aesthetic Clinic, we combine advanced South Korean skincare technology, innovative techniques, and individualized treatments to enhance your natural beauty and boost your confidence.",
                    "We believe that true beauty starts with healthy skin and holistic wellness. Our clinic offers a comprehensive range of personalized treatments tailored for Skin, Beauty and Wellness. Whether you are looking for deep skin rejuvenation, glow-enhancing therapies, anti-aging solutions, or relaxing aesthetic care, our expert team is here to guide you on your transformation journey.",
                    "Experience world-class Korean aesthetic standards right here in Puzhuthivakkam."
                ],
                "image_url": "",
                "updated_at": datetime.datetime.utcnow(),
                "updated_by": "admin@aglow.com"
            })
            logger.info("Seeded default about content.")

        # 2. Seed Services
        services_col = get_services_col()
        if services_col.count_documents({}) == 0:
            default_services = [
                # Skin Rejuvenation and Resurfacing
                {"name": "Medical Grade Chemical Peels", "category": "Skin Rejuvenation and Resurfacing", "description": "Refine skin texture and tone with customized clinical chemical peels."},
                {"name": "Micro Needling", "category": "Skin Rejuvenation and Resurfacing", "description": "Collagen induction therapy for smoother, firmer skin texture."},
                {"name": "Laser Skin Resurfacing", "category": "Skin Rejuvenation and Resurfacing", "description": "Advanced laser treatment targeting imperfections and renewing skin cells."},
                {"name": "Intense Pulsed Light", "category": "Skin Rejuvenation and Resurfacing", "description": "IPL photo-facial to target pigmentation, redness, and sun damage."},
                {"name": "Advanced Facials", "category": "Skin Rejuvenation and Resurfacing", "description": "Deep cleansing, hydration and nourishment tailored to your skin concerns."},
                {"name": "Derma Planing", "category": "Skin Rejuvenation and Resurfacing", "description": "Gentle exfoliation removing dead skin cells and peach fuzz for instant radiance."},
                # Energy Based Skin Tightening and Lifting
                {"name": "High Intensity Focused Ultrasound (HIFU)", "category": "Energy Based Skin Tightening and Lifting", "description": "Non-surgical face lifting and skin tightening targeting deep structural layers."},
                {"name": "Radio Frequency", "category": "Energy Based Skin Tightening and Lifting", "description": "Firming skin and boosting collagen using gentle radiofrequency warmth."},
                {"name": "RF Micro Needling", "category": "Energy Based Skin Tightening and Lifting", "description": "Combining microneedling and RF energy for deeper skin remodeling."},
                {"name": "Thread Lifts", "category": "Energy Based Skin Tightening and Lifting", "description": "Minimally invasive lifting of facial features using dissolvable threads. (Performed only by doctors)"},
                # Hair and Regenerative Therapies
                {"name": "Exosome Therapy", "category": "Hair and Regenerative Therapies", "description": "Advanced cellular regenerative therapy for hair restoration and skin healing."},
                {"name": "Scalp Micro Needling & Hair Mesotherapy", "category": "Hair and Regenerative Therapies", "description": "Scalp treatments to stimulate hair growth and nutrient delivery."},
                # IV Nutrient Infusions
                {"name": "Skin & Wellness Drips", "category": "IV Nutrient Infusions", "description": "Intravenous vitamin and antioxidant therapy for health, immunity and skin radiance."},
                # Injectables and Anti Aging
                {"name": "Botox", "category": "Injectables and Anti Aging", "description": "Wrinkle-relaxing injections for a smoother, youthful forehead and eye area. (Strictly by professional doctors)"},
                {"name": "Dermal Fillers", "category": "Injectables and Anti Aging", "description": "Restoring volume and structure to cheeks, lips, and jawlines. (Strictly by professional doctors)"},
                {"name": "Bio Stimulators", "category": "Injectables and Anti Aging", "description": "Injectables that stimulate your body's natural collagen production over time. (Strictly by professional doctors)"},
                {"name": "Skin Boosters", "category": "Injectables and Anti Aging", "description": "Deep skin hydration treatments for improved elasticity and radiant glow. (Strictly by professional doctors)"},
                # Lasers
                {"name": "Carbon Laser", "category": "Lasers", "description": "The 'Hollywood Peel' for pore tightening, oil control, and skin brightening."},
                {"name": "Laser Hair Reduction", "category": "Lasers", "description": "Safe and effective laser treatments for long-lasting hair removal."}
            ]
            for s in default_services:
                s["image_url"] = ""
                s["price"] = None
                s["created_at"] = datetime.datetime.utcnow()
                s["created_by"] = "admin@aglow.com"
            services_col.insert_many(default_services)
            logger.info("Seeded default services.")

        # 3. Seed Offers
        offers_col = get_offers_col()
        if offers_col.count_documents({}) == 0:
            offers_col.insert_one({
                "title": "Grand Opening Offer",
                "discount": "20% OFF",
                "description": "Get 20% instant discount on your very first treatment session at Aglow Aesthetics.",
                "promo_code": "AGLOW20",
                "start_date": "2026-01-01",
                "end_date": "2026-12-31",
                "special": True,
                "created_at": datetime.datetime.utcnow(),
                "created_by": "admin@aglow.com"
            })
            logger.info("Seeded default offers.")

        # 4. Seed Locations
        locations_col = get_locations_col()
        if locations_col.count_documents({}) == 0:
            locations_col.insert_one({
                "name": "Aglow Aesthetics Puzhuthivakkam",
                "address": "Door No. 5, Plot No. 33, 2nd Floor, Sapthagiri Nagar, Inner Ring Road, Puzhuthivakkam, Chennai - 600091",
                "google_maps_iframe_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.3516803714243!2d80.205986!3d12.9746823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d8b888eb3bf%3A0x64f434df89f64ee5!2sInner%20Ring%2C%20Puzhuthivakkam%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
                "latitude": 12.9746823,
                "longitude": 80.2081747,
                "created_at": datetime.datetime.utcnow()
            })
            logger.info("Seeded default locations.")

        # 5. Seed Testimonials
        testimonials_col = get_testimonials_col()
        if testimonials_col.count_documents({}) == 0:
            default_testimonials = [
                {
                    "type": "text",
                    "author": "Divya R.",
                    "treatment": "Advanced Facial",
                    "text": "My skin has never looked this clear. The Korean protocols here are on another level — calm, clinical and genuinely effective.",
                    "content_url": "",
                    "image_url": "",
                    "created_at": datetime.datetime.utcnow()
                },
                {
                    "type": "text",
                    "author": "Sneha K.",
                    "treatment": "HIFU Lifting",
                    "text": "Visible lift after a single session and zero downtime. The team explained every step before starting.",
                    "content_url": "",
                    "image_url": "",
                    "created_at": datetime.datetime.utcnow()
                },
                {
                    "type": "text",
                    "author": "Arun M.",
                    "treatment": "Exosome Therapy",
                    "text": "I came in for hair thinning and the difference in three months has been remarkable. Truly personalised care.",
                    "content_url": "",
                    "image_url": "",
                    "created_at": datetime.datetime.utcnow()
                }
            ]
            testimonials_col.insert_many(default_testimonials)
            logger.info("Seeded default testimonials.")
    except Exception as e:
        logger.error(f"Error seeding initial content on startup: {e}")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "Aglow Aesthetics API",
        "message": "Welcome to Aglow Aesthetics Korean Skincare Clinic API Portal"
    }
