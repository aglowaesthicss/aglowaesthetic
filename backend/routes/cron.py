from fastapi import APIRouter, HTTPException, status
import datetime
from bson import ObjectId

from db import get_sessions_col
from email_utils import send_session_reminder

router = APIRouter(prefix="/api/cron", tags=["cron"])

@router.get("/send-reminders")
def send_daily_session_reminders():
    sessions_col = get_sessions_col()
    
    # Get today's date in local Chennai timezone format (YYYY-MM-DD)
    # Using UTC + 5:30 offset
    chennai_time = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
    today_str = chennai_time.strftime("%Y-%m-%d")
    
    # Find all sessions for today that haven't sent reminders yet
    sessions_today = list(sessions_col.find({
        "date": today_str,
        "status": "scheduled",
        "reminder_sent": {"$ne": True}
    }))
    
    sent_count = 0
    errors = []
    
    for session in sessions_today:
        client_name = session.get("client_name")
        client_email = session.get("client_email")
        service_name = session.get("service_name")
        time_str = session.get("time")
        
        if not client_email:
            continue
            
        try:
            success = send_session_reminder(
                client_name=client_name,
                client_email=client_email,
                service_name=service_name,
                date_str=today_str,
                time_str=time_str
            )
            
            if success:
                # Mark as reminder sent
                sessions_col.update_one(
                    {"_id": session["_id"]},
                    {"$set": {"reminder_sent": True}}
                )
                sent_count += 1
        except Exception as e:
            errors.append(f"Session {session['_id']}: {str(e)}")
            
    return {
        "message": f"Daily session reminder check completed for date {today_str}",
        "reminders_sent": sent_count,
        "errors": errors
    }
