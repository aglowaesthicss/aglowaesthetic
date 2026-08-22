from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
import datetime
from typing import Optional

from auth import get_current_user, RoleChecker, FeatureChecker
from db import get_feedback_col

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

class FeedbackCreate(BaseModel):
    type: str  # 'feedback' or 'complaint'
    details: str

class FeedbackReply(BaseModel):
    response: str

def serialize_feedback(f):
    return {
        "id": str(f["_id"]),
        "client_user_id": f.get("client_user_id"),
        "client_name": f.get("client_name"),
        "client_email": f.get("client_email"),
        "type": f.get("type"),
        "details": f.get("details"),
        "response": f.get("response"),
        "created_at": f.get("created_at"),
        "responded_at": f.get("responded_at")
    }

@router.get("", dependencies=[Depends(FeatureChecker("feedback"))])
def get_feedback(current_user: dict = Depends(get_current_user)):
    col = get_feedback_col()
    
    # Client sees their own feedback history
    if current_user["role"] == "client":
        feedbacks = list(col.find({"client_user_id": current_user["id"]}))
    # Admins/Staff see all feedback
    else:
        feedbacks = list(col.find())
        
    feedbacks.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [serialize_feedback(f) for f in feedbacks]

@router.post("", dependencies=[Depends(FeatureChecker("feedback"))])
def submit_feedback(
    request: FeedbackCreate,
    current_user: dict = Depends(RoleChecker(["client"]))
):
    col = get_feedback_col()
    
    if request.type not in ["feedback", "complaint"]:
        raise HTTPException(status_code=400, detail="Invalid feedback type. Must be 'feedback' or 'complaint'")
        
    new_fb = {
        "client_user_id": current_user["id"],
        "client_name": current_user.get("name"),
        "client_email": current_user.get("email"),
        "type": request.type,
        "details": request.details,
        "response": None,
        "created_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "responded_at": None
    }
    
    result = col.insert_one(new_fb)
    new_fb["id"] = str(result.inserted_id)
    return serialize_feedback(new_fb)

@router.post("/{fb_id}/reply", dependencies=[Depends(FeatureChecker("feedback"))])
def reply_feedback(
    fb_id: str,
    request: FeedbackReply,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    col = get_feedback_col()
    
    try:
        obj_id = ObjectId(fb_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")
        
    feedback = col.find_one({"_id": obj_id})
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback or complaint record not found")
        
    col.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "response": request.response,
                "responded_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
        }
    )
    
    updated = col.find_one({"_id": obj_id})
    return serialize_feedback(updated)
