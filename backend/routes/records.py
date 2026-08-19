from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from bson import ObjectId
from typing import List, Optional
import datetime
import cloudinary.uploader

from auth import get_current_user, RoleChecker, FeatureChecker
from db import get_service_histories_col, get_sessions_col, get_users_col

router = APIRouter(prefix="/api/records", tags=["records"])

# Schemas
class ServiceHistoryCreate(BaseModel):
    client_user_id: str  # The Mongo _id of the client user
    service_name: str
    date: str  # YYYY-MM-DD
    price: float
    invoice_url: Optional[str] = ""
    notes: Optional[str] = ""

class ServiceHistoryUpdate(BaseModel):
    service_name: Optional[str] = None
    date: Optional[str] = None
    price: Optional[float] = None
    invoice_url: Optional[str] = None
    notes: Optional[str] = None

class SessionDateTime(BaseModel):
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class SessionCreate(BaseModel):
    client_user_id: str  # The Mongo _id of the client user
    service_name: str
    slots: List[SessionDateTime]

class SessionUpdate(BaseModel):
    service_name: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None  # e.g., 'scheduled', 'completed', 'cancelled'

# Helper to serialize Mongo docs
def serialize_history(h):
    return {
        "id": str(h["_id"]),
        "client_user_id": h.get("client_user_id"),
        "client_name": h.get("client_name"),
        "client_email": h.get("client_email"),
        "service_name": h.get("service_name"),
        "date": h.get("date"),
        "price": h.get("price"),
        "invoice_url": h.get("invoice_url"),
        "notes": h.get("notes")
    }

def serialize_session(s):
    return {
        "id": str(s["_id"]),
        "client_user_id": s.get("client_user_id"),
        "client_name": s.get("client_name"),
        "client_email": s.get("client_email"),
        "client_phone": s.get("client_phone"),
        "service_name": s.get("service_name"),
        "date": s.get("date"),
        "time": s.get("time"),
        "status": s.get("status", "scheduled")
    }

# --- SERVICE HISTORY ENDPOINTS ---

@router.get("/history", dependencies=[Depends(FeatureChecker("service_history"))])
def get_service_history(current_user: dict = Depends(get_current_user)):
    history_col = get_service_histories_col()
    
    # Clients can only view their own history
    if current_user["role"] == "client":
        histories = list(history_col.find({"client_user_id": current_user["id"]}))
    else:
        histories = list(history_col.find())
        
    histories.sort(key=lambda x: x.get("date", ""), reverse=True)
    return [serialize_history(h) for h in histories]

@router.post("/history", dependencies=[Depends(FeatureChecker("service_history"))])
def add_service_history(
    request: ServiceHistoryCreate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    history_col = get_service_histories_col()
    users_col = get_users_col()
    
    # Verify client exists
    try:
        client_obj_id = ObjectId(request.client_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client user ID format")
        
    client = users_col.find_one({"_id": client_obj_id, "role": "client"})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    new_history = {
        "client_user_id": request.client_user_id,
        "client_name": client.get("name"),
        "client_email": client.get("email"),
        "service_name": request.service_name,
        "date": request.date,
        "price": request.price,
        "invoice_url": request.invoice_url,
        "notes": request.notes,
        "created_at": datetime.datetime.utcnow(),
        "created_by": current_user["email"]
    }
    
    result = history_col.insert_one(new_history)
    new_history["id"] = str(result.inserted_id)
    return serialize_history(new_history)

# Helper to support direct upload of Invoice files to Cloudinary
@router.post("/history/upload-invoice", dependencies=[Depends(FeatureChecker("service_history"))])
def upload_invoice_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    try:
        import uuid
        filename = file.filename.lower()
        ext = filename.split(".")[-1] if "." in filename else ""
        random_id = str(uuid.uuid4())
        
        res_type = "raw" if ext == "pdf" or file.content_type == "application/pdf" else "auto"
        public_id = f"aglow_invoices/{random_id}.{ext}" if ext else f"aglow_invoices/{random_id}"
        
        result = cloudinary.uploader.upload(
            file.file,
            resource_type=res_type,
            public_id=public_id
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload to Cloudinary failed: {e}")

@router.put("/history/{history_id}", dependencies=[Depends(FeatureChecker("service_history"))])
def update_service_history(
    history_id: str,
    request: ServiceHistoryUpdate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    history_col = get_service_histories_col()
    
    try:
        hist_obj_id = ObjectId(history_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service history ID format")
        
    history = history_col.find_one({"_id": hist_obj_id})
    if not history:
        raise HTTPException(status_code=404, detail="Service history record not found")
        
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.datetime.utcnow()
        update_data["updated_by"] = current_user["email"]
        history_col.update_one({"_id": hist_obj_id}, {"$set": update_data})
        
    updated_history = history_col.find_one({"_id": hist_obj_id})
    return serialize_history(updated_history)

@router.delete("/history/{history_id}", dependencies=[Depends(FeatureChecker("service_history"))])
def delete_service_history(
    history_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    history_col = get_service_histories_col()
    
    try:
        hist_obj_id = ObjectId(history_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service history ID format")
        
    result = history_col.delete_one({"_id": hist_obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service history record not found")
        
    return {"message": "Service history deleted successfully"}


# --- SESSION TRACKING ENDPOINTS ---

@router.get("/sessions", dependencies=[Depends(FeatureChecker("session_tracking"))])
def get_sessions(current_user: dict = Depends(get_current_user)):
    sessions_col = get_sessions_col()
    
    # Clients can only view their own sessions
    if current_user["role"] == "client":
        sessions = list(sessions_col.find({"client_user_id": current_user["id"]}))
    else:
        sessions = list(sessions_col.find())
        
    # Sort sessions by date and time
    sessions.sort(key=lambda x: (x.get("date", ""), x.get("time", "")))
    return [serialize_session(s) for s in sessions]

@router.post("/sessions", dependencies=[Depends(FeatureChecker("session_tracking"))])
def add_sessions(
    request: SessionCreate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    sessions_col = get_sessions_col()
    users_col = get_users_col()
    
    try:
        client_obj_id = ObjectId(request.client_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client user ID format")
        
    client = users_col.find_one({"_id": client_obj_id, "role": "client"})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    created_sessions = []
    
    # Create an individual session record for each date/time slot specified
    for slot in request.slots:
        new_session = {
            "client_user_id": request.client_user_id,
            "client_name": client.get("name"),
            "client_email": client.get("email"),
            "client_phone": client.get("mobile_no"),
            "service_name": request.service_name,
            "date": slot.date,
            "time": slot.time,
            "status": "scheduled",
            "created_at": datetime.datetime.utcnow(),
            "created_by": current_user["email"]
        }
        
        result = sessions_col.insert_one(new_session)
        new_session["id"] = str(result.inserted_id)
        created_sessions.append(serialize_session(new_session))
        
    return created_sessions

@router.put("/sessions/{session_id}", dependencies=[Depends(FeatureChecker("session_tracking"))])
def update_session(
    session_id: str,
    request: SessionUpdate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    sessions_col = get_sessions_col()
    
    try:
        sess_obj_id = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
        
    session = sessions_col.find_one({"_id": sess_obj_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session record not found")
        
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.datetime.utcnow()
        update_data["updated_by"] = current_user["email"]
        sessions_col.update_one({"_id": sess_obj_id}, {"$set": update_data})
        
    updated_session = sessions_col.find_one({"_id": sess_obj_id})
    return serialize_session(updated_session)

@router.delete("/sessions/{session_id}", dependencies=[Depends(FeatureChecker("session_tracking"))])
def delete_session(
    session_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    sessions_col = get_sessions_col()
    
    try:
        sess_obj_id = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
        
    result = sessions_col.delete_one({"_id": sess_obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session record not found")
        
    return {"message": "Session deleted successfully"}
