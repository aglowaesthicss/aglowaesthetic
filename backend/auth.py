from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId

from config import settings
from db import get_users_col, get_access_controls_col

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    users_col = get_users_col()
    user = users_col.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Convert _id to string for convenience
    user["id"] = str(user["_id"])
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        # Master Admin (Founder, Owner) has complete, override access to everything
        if current_user.get("role") == "master_admin":
            return current_user
            
        if current_user.get("role") not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user

# Access control check for features
def verify_feature_access(feature: str, user: dict) -> bool:
    """
    Check if a feature is enabled for the user's role.
    Features: service_history, session_tracking, services, offers, feedback, location, testimonial
    """
    role = user.get("role")
    if role == "master_admin":
        return True  # Master Admin always has full access and cannot be revoked
        
    # Get access control from db
    ac_col = get_access_controls_col()
    policy = ac_col.find_one({"role": role})
    
    if policy:
        allowed_features = policy.get("allowed_features", [])
        return feature in allowed_features
        
    # Default permissions if policy is not set
    # Default: staff and client have access to features unless revoked
    return True

class FeatureChecker:
    def __init__(self, feature: str):
        self.feature = feature

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        if not verify_feature_access(self.feature, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access to feature '{self.feature}' has been revoked for your role"
            )
        return current_user
