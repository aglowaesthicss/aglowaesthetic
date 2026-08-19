from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from typing import List, Optional
import datetime

from auth import get_current_user, RoleChecker, get_password_hash
from db import get_users_col, get_access_controls_col
from email_utils import send_welcome_email

router = APIRouter(prefix="/api/users", tags=["users"])

# Schemas
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    mobile_no: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None
    client_id: Optional[str] = None

class StaffCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str  # 'master_admin' or 'staff'

class ClientCreate(BaseModel):
    email: EmailStr
    name: str
    mobile_no: str
    age: int
    location: str
    client_id: str

class ClientUpdate(BaseModel):
    email: EmailStr
    name: str
    mobile_no: str
    age: int
    location: str
    client_id: str


class AccessControlSave(BaseModel):
    role: str
    allowed_features: List[str]

@router.get("", response_model=List[UserResponse])
def get_users(current_user: dict = Depends(get_current_user)):
    users_col = get_users_col()
    
    # Staff can only view clients
    if current_user["role"] == "staff":
        users = list(users_col.find({"role": "client"}))
    # Admin can view everyone
    elif current_user["role"] == "master_admin":
        users = list(users_col.find())
    else:
        # Client cannot view user list
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clients do not have access to user directory"
        )
        
    res = []
    for u in users:
        res.append({
            "id": str(u["_id"]),
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "mobile_no": u.get("mobile_no"),
            "age": u.get("age"),
            "location": u.get("location"),
            "client_id": u.get("client_id")
        })
    return res

@router.post("/staff", response_model=UserResponse)
def create_staff(
    request: StaffCreate,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    users_col = get_users_col()
    
    if request.role not in ["master_admin", "staff"]:
        raise HTTPException(status_code=400, detail="Invalid staff role")
        
    existing = users_col.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    password_hash = get_password_hash(request.password)
    
    new_user = {
        "email": request.email.lower(),
        "name": request.name,
        "role": request.role,
        "password_hash": password_hash,
        "created_at": datetime.datetime.utcnow(),
        "created_by": current_user["email"]
    }
    
    result = users_col.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    return new_user

@router.post("/client", response_model=UserResponse)
def create_client(
    request: ClientCreate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    users_col = get_users_col()
    
    existing = users_col.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Client with this email already exists")
        
    # Extract temporary password: last 5 digits of phone number
    phone_digits = "".join([c for c in request.mobile_no if c.isdigit()])
    if len(phone_digits) < 5:
        # Fallback if phone number is shorter than 5 digits
        temp_password = phone_digits if phone_digits else "12345"
    else:
        temp_password = phone_digits[-5:]
        
    password_hash = get_password_hash(temp_password)
    
    new_client = {
        "email": request.email.lower(),
        "name": request.name,
        "role": "client",
        "mobile_no": request.mobile_no,
        "age": request.age,
        "location": request.location,
        "client_id": request.client_id,
        "password_hash": password_hash,
        "created_at": datetime.datetime.utcnow(),
        "created_by": current_user["email"]
    }
    
    result = users_col.insert_one(new_client)
    new_client["id"] = str(result.inserted_id)
    
    # Send welcome email using Resend
    send_welcome_email(
        client_name=request.name,
        client_email=request.email.lower(),
        temp_password=temp_password
    )
    
    return new_client

@router.get("/access-control")
def get_access_control(current_user: dict = Depends(RoleChecker(["master_admin"]))):
    ac_col = get_access_controls_col()
    policies = list(ac_col.find())
    
    # Parse policies
    res = {}
    for p in policies:
        res[p["role"]] = p["allowed_features"]
        
    # Set default values if empty
    default_features = [
        "service_history", "session_tracking", "services", 
        "offers", "feedback", "location", "testimonial"
    ]
    if "staff" not in res:
        res["staff"] = default_features
    if "client" not in res:
        res["client"] = default_features
        
    return res

@router.post("/access-control")
def save_access_control(
    request: AccessControlSave,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    ac_col = get_access_controls_col()
    
    if request.role == "master_admin":
        raise HTTPException(
            status_code=400, 
            detail="Cannot update/revoke permissions for Master Admin"
        )
        
    ac_col.update_one(
        {"role": request.role},
        {"$set": {"allowed_features": request.allowed_features}},
        upsert=True
    )
    
    return {"message": f"Permissions updated successfully for role '{request.role}'"}

@router.put("/client/{client_id}", response_model=UserResponse)
def update_client(
    client_id: str,
    request: ClientUpdate,
    current_user: dict = Depends(RoleChecker(["master_admin", "staff"]))
):
    users_col = get_users_col()
    
    try:
        obj_id = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client ID")
        
    client = users_col.find_one({"_id": obj_id, "role": "client"})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    existing = users_col.find_one({
        "email": request.email.lower(),
        "_id": {"$ne": obj_id}
    })
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    update_data = {
        "email": request.email.lower(),
        "name": request.name,
        "mobile_no": request.mobile_no,
        "age": request.age,
        "location": request.location,
        "client_id": request.client_id,
        "updated_at": datetime.datetime.utcnow(),
        "updated_by": current_user["email"]
    }
    
    users_col.update_one({"_id": obj_id}, {"$set": update_data})
    
    updated = users_col.find_one({"_id": obj_id})
    return {
        "id": str(updated["_id"]),
        "email": updated["email"],
        "name": updated["name"],
        "role": updated["role"],
        "mobile_no": updated.get("mobile_no"),
        "age": updated.get("age"),
        "location": updated.get("location"),
        "client_id": updated.get("client_id")
    }

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    users_col = get_users_col()
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    if obj_id == ObjectId(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
        
    result = users_col.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User deleted successfully"}

