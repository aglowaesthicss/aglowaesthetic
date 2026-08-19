from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import timedelta

from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    RoleChecker
)
from db import get_users_col, get_access_controls_col

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class AdminPasswordUpdateRequest(BaseModel):
    user_id: str
    new_password: str

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    users_col = get_users_col()
    user = users_col.find_one({"email": request.email.lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    
    # Resolve permissions
    role = user["role"]
    if role == "master_admin":
        allowed_features = ["service_history", "session_tracking", "services", "offers", "feedback", "location", "testimonial"]
    else:
        ac_col = get_access_controls_col()
        policy = ac_col.find_one({"role": role})
        allowed_features = policy.get("allowed_features") if policy else ["service_history", "session_tracking", "services", "offers", "feedback", "location", "testimonial"]

    # Format user info for response
    user_info = {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "allowed_features": allowed_features
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_info
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    if role == "master_admin":
        allowed_features = ["service_history", "session_tracking", "services", "offers", "feedback", "location", "testimonial"]
    else:
        ac_col = get_access_controls_col()
        policy = ac_col.find_one({"role": role})
        allowed_features = policy.get("allowed_features") if policy else ["service_history", "session_tracking", "services", "offers", "feedback", "location", "testimonial"]

    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "mobile_no": current_user.get("mobile_no"),
        "age": current_user.get("age"),
        "location": current_user.get("location"),
        "client_id": current_user.get("client_id")
    }

@router.post("/change-password")
def change_password(request: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    users_col = get_users_col()
    
    if not verify_password(request.current_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
        
    new_hash = get_password_hash(request.new_password)
    users_col.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password updated successfully"}

@router.post("/update-password-admin")
def admin_update_password(
    request: AdminPasswordUpdateRequest,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    users_col = get_users_col()
    
    try:
        user_obj_id = ObjectId(request.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    user = users_col.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_hash = get_password_hash(request.new_password)
    users_col.update_one(
        {"_id": user_obj_id},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": f"Password for user {user['name']} has been updated"}
