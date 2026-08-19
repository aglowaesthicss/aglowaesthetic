from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Header
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from typing import List, Optional
import datetime
import cloudinary.uploader

from auth import get_current_user, RoleChecker, FeatureChecker
from db import (
    get_services_col,
    get_offers_col,
    get_locations_col,
    get_testimonials_col,
    get_enquiries_col,
    get_about_col
)
from email_utils import notify_new_offer, notify_admin_new_enquiry

router = APIRouter(prefix="/api/content", tags=["content"])

# Schemas
class AboutUpdate(BaseModel):
    intro: str = "Chennai's First Ever Korean Aesthetics"
    tagline: str = "Transforming skin, beauty and wellness with authentic Korean care"
    paragraphs: List[str]
    image_url: Optional[str] = ""

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    price: Optional[float] = None
    category: Optional[str] = "Skin Rejuvenation and Resurfacing"

class OfferCreate(BaseModel):
    title: str
    discount: str
    description: str
    promo_code: Optional[str] = ""
    start_date: str  # YYYY-MM-DD
    end_date: str  # YYYY-MM-DD
    special: bool = False

class LocationCreate(BaseModel):
    name: str
    address: str
    google_maps_iframe_url: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TestimonialCreate(BaseModel):
    type: str  # 'instagram', 'youtube', 'text_image'
    content_url: Optional[str] = ""
    text: Optional[str] = ""
    image_url: Optional[str] = ""
    author: str
    treatment: Optional[str] = ""

class EnquirySubmit(BaseModel):
    name: str
    email: EmailStr
    phone: str
    location: str
    service: str

# Helper helpers
def serialize_doc(d):
    doc = d.copy()
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

# --- SERVICES ENDPOINTS ---

@router.get("/services")
def get_services():
    col = get_services_col()
    services = list(col.find())
    return [serialize_doc(s) for s in services]

@router.post("/services")
def add_service(
    request: ServiceCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_services_col()
    existing = col.find_one({"name": request.name})
    if existing:
        raise HTTPException(status_code=400, detail="Service already exists")
        
    new_service = request.model_dump()
    new_service["created_at"] = datetime.datetime.utcnow()
    new_service["created_by"] = current_user["email"]
    
    result = col.insert_one(new_service)
    new_service["id"] = str(result.inserted_id)
    return serialize_doc(new_service)

@router.post("/services/upload-image")
def upload_service_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="aglow_services"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

@router.put("/services/{service_id}")
def update_service(
    service_id: str,
    request: ServiceCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_services_col()
    try:
        obj_id = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service ID")
        
    service = col.find_one({"_id": obj_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    update_data = request.model_dump()
    update_data["updated_at"] = datetime.datetime.utcnow()
    update_data["updated_by"] = current_user["email"]
    
    col.update_one({"_id": obj_id}, {"$set": update_data})
    updated = col.find_one({"_id": obj_id})
    return serialize_doc(updated)

@router.delete("/services/{service_id}")
def delete_service(
    service_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_services_col()
    try:
        obj_id = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service ID")
        
    result = col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}


# --- ABOUT US ENDPOINTS ---

@router.get("/about")
def get_about_info():
    col = get_about_col()
    about_doc = col.find_one()
    if not about_doc:
        return {
            "intro": "Chennai's First Ever Korean Aesthetics",
            "tagline": "Transforming skin, beauty and wellness with authentic Korean care",
            "paragraphs": [
                "At Aglow Aesthetics, located in the heart of Puzhuthivakkam, Chennai, we bring you the secrets of flawless, glass-skin beauty straight from South Korea. As Chennai's First Ever Korean Aesthetic Clinic, we combine advanced South Korean skincare technology, innovative techniques, and individualized treatments to enhance your natural beauty and boost your confidence.",
                "We believe that true beauty starts with healthy skin and holistic wellness. Our clinic offers a comprehensive range of personalized treatments tailored for Skin, Beauty and Wellness. Whether you are looking for deep skin rejuvenation, glow-enhancing therapies, anti-aging solutions, or relaxing aesthetic care, our expert team is here to guide you on your transformation journey.",
                "Experience world-class Korean aesthetic standards right here in Puzhuthivakkam."
            ],
            "image_url": ""
        }
    return serialize_doc(about_doc)

@router.post("/about")
def save_about_info(
    request: AboutUpdate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_about_col()
    data = request.model_dump()
    data["updated_at"] = datetime.datetime.utcnow()
    data["updated_by"] = current_user["email"]
    
    existing = col.find_one()
    if existing:
        col.update_one({"_id": existing["_id"]}, {"$set": data})
        data["id"] = str(existing["_id"])
    else:
        result = col.insert_one(data)
        data["id"] = str(result.inserted_id)
        
    return data

@router.post("/about/upload-image")
def upload_about_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="aglow_about"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")


# --- OFFERS ENDPOINTS ---

@router.get("/offers")
def get_offers(authorization: Optional[str] = Header(None)):
    col = get_offers_col()
    offers = list(col.find())
    
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            from jose import jwt
            from config import settings
            from db import get_users_col
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if email:
                current_user = get_users_col().find_one({"email": email})
        except Exception:
            pass
            
    role = current_user.get("role") if current_user else "public"
    
    if role in ["client", "public"]:
        if role == "client":
            from auth import verify_feature_access
            if not verify_feature_access("offers", current_user):
                raise HTTPException(status_code=403, detail="Access to Offers is revoked for your role")
                
        today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        offers = [
            o for o in offers 
            if today <= o.get("end_date", "")
        ]
        
    return [serialize_doc(o) for o in offers]

@router.post("/offers")
def add_offer(
    request: OfferCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_offers_col()
    new_offer = request.model_dump()
    new_offer["created_at"] = datetime.datetime.utcnow()
    new_offer["created_by"] = current_user["email"]
    
    result = col.insert_one(new_offer)
    new_offer["id"] = str(result.inserted_id)
    
    # Notify all clients about this new offer (run in background/thread ideally)
    notify_new_offer(
        offer_title=request.title,
        discount=request.discount,
        description=request.description,
        promo_code=request.promo_code,
        end_date=request.end_date
    )
    
    return serialize_doc(new_offer)

@router.put("/offers/{offer_id}")
def update_offer(
    offer_id: str,
    request: OfferCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_offers_col()
    try:
        obj_id = ObjectId(offer_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid offer ID")
        
    offer = col.find_one({"_id": obj_id})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    update_data = request.model_dump()
    update_data["updated_at"] = datetime.datetime.utcnow()
    update_data["updated_by"] = current_user["email"]
    
    col.update_one({"_id": obj_id}, {"$set": update_data})
    updated = col.find_one({"_id": obj_id})
    return serialize_doc(updated)

@router.delete("/offers/{offer_id}")
def delete_offer(
    offer_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_offers_col()
    try:
        obj_id = ObjectId(offer_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid offer ID")
        
    result = col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer deleted successfully"}


# --- LOCATIONS ENDPOINTS ---

@router.get("/locations")
def get_locations(authorization: Optional[str] = Header(None)):
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            from jose import jwt
            from config import settings
            from db import get_users_col
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if email:
                current_user = get_users_col().find_one({"email": email})
        except Exception:
            pass

    if current_user and current_user.get("role") == "client":
        from auth import verify_feature_access
        if not verify_feature_access("location", current_user):
            raise HTTPException(status_code=403, detail="Access to Locations is revoked for your role")
            
    col = get_locations_col()
    locations = list(col.find())
    return [serialize_doc(l) for l in locations]

@router.post("/locations")
def add_location(
    request: LocationCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_locations_col()
    new_location = request.model_dump()
    new_location["created_at"] = datetime.datetime.utcnow()
    
    result = col.insert_one(new_location)
    new_location["id"] = str(result.inserted_id)
    return serialize_doc(new_location)

@router.put("/locations/{loc_id}")
def update_location(
    loc_id: str,
    request: LocationCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_locations_col()
    try:
        obj_id = ObjectId(loc_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid location ID")
        
    location = col.find_one({"_id": obj_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    update_data = request.model_dump()
    col.update_one({"_id": obj_id}, {"$set": update_data})
    updated = col.find_one({"_id": obj_id})
    return serialize_doc(updated)

@router.delete("/locations/{loc_id}")
def delete_location(
    loc_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_locations_col()
    try:
        obj_id = ObjectId(loc_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid location ID")
        
    result = col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}


# --- TESTIMONIALS ENDPOINTS ---

@router.get("/testimonials")
def get_testimonials(authorization: Optional[str] = Header(None)):
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            from jose import jwt
            from config import settings
            from db import get_users_col
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if email:
                current_user = get_users_col().find_one({"email": email})
        except Exception:
            pass

    if current_user and current_user.get("role") == "client":
        from auth import verify_feature_access
        if not verify_feature_access("testimonial", current_user):
            raise HTTPException(status_code=403, detail="Access to Testimonials is revoked for your role")
            
    col = get_testimonials_col()
    testimonials = list(col.find())
    return [serialize_doc(t) for t in testimonials]

@router.post("/testimonials")
def add_testimonial(
    request: TestimonialCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_testimonials_col()
    new_testimonial = request.model_dump()
    new_testimonial["created_at"] = datetime.datetime.utcnow()
    
    result = col.insert_one(new_testimonial)
    new_testimonial["id"] = str(result.inserted_id)
    return serialize_doc(new_testimonial)

@router.post("/testimonials/upload-image")
def upload_testimonial_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="aglow_testimonials"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

@router.put("/testimonials/{test_id}")
def update_testimonial(
    test_id: str,
    request: TestimonialCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_testimonials_col()
    try:
        obj_id = ObjectId(test_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid testimonial ID")
        
    testimonial = col.find_one({"_id": obj_id})
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
        
    update_data = request.model_dump()
    col.update_one({"_id": obj_id}, {"$set": update_data})
    updated = col.find_one({"_id": obj_id})
    return serialize_doc(updated)

@router.delete("/testimonials/{test_id}")
def delete_testimonial(
    test_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_testimonials_col()
    try:
        obj_id = ObjectId(test_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid testimonial ID")
        
    result = col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}


# --- PUBLIC ENQUIRY ENDPOINTS ---

@router.post("/enquiry")
def submit_enquiry(request: EnquirySubmit):
    col = get_enquiries_col()
    
    new_enquiry = request.model_dump()
    new_enquiry["created_at"] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    new_enquiry["status"] = "pending"
    
    result = col.insert_one(new_enquiry)
    new_enquiry["id"] = str(result.inserted_id)
    
    # Notify Admins and Staff
    notify_admin_new_enquiry(new_enquiry)
    
    return {"message": "Enquiry submitted successfully", "id": new_enquiry["id"]}

@router.get("/enquiries")
def get_enquiries(current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))):
    col = get_enquiries_col()
    enquiries = list(col.find())
    return [serialize_doc(e) for e in enquiries]
