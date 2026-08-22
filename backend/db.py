from pymongo import MongoClient
from config import settings
import logging

logger = logging.getLogger("aglow_db")

try:
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.DB_NAME]
    # Ping the database to verify connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB!")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    # Fallback client if connection fails to prevent app crash at startup in some dev envs
    client = None
    db = None

def get_collection(name: str):
    if db is None:
        raise Exception("Database connection is not initialized")
    return db[name]

# Helper collections
def get_users_col():
    return get_collection("users")

def get_services_col():
    return get_collection("services")

def get_offers_col():
    return get_collection("offers")

def get_sessions_col():
    return get_collection("sessions")

def get_service_histories_col():
    return get_collection("service_histories")

def get_feedback_col():
    return get_collection("feedback_complaints")

def get_locations_col():
    return get_collection("locations")

def get_testimonials_col():
    return get_collection("testimonials")

def get_enquiries_col():
    return get_collection("enquiries")

def get_settings_col():
    return get_collection("settings")

def get_access_controls_col():
    return get_collection("access_controls")

def get_about_col():
    return get_collection("about")
