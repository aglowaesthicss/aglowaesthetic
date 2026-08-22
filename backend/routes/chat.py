from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
import litellm
import datetime

from db import (
    get_services_col,
    get_locations_col,
    get_offers_col,
    get_settings_col
)
from config import settings
from auth import RoleChecker

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class LLMSettingsSave(BaseModel):
    provider: str  # 'gemini' or 'openai' or 'Mistral'
    api_key: str

@router.post("")
def chat_with_bot(request: ChatRequest):
    # 1. Fetch LLM settings from DB
    settings_col = get_settings_col()
    llm_settings = settings_col.find_one({"key": "llm_settings"})
    
    provider = "gemini"
    api_key = settings.GEMINI_API_KEY
    
    if llm_settings:
        provider = llm_settings.get("provider", "gemini")
        api_key = llm_settings.get("api_key", "")
        
    if not api_key:
        # Fallback to env variables if DB settings are empty
        if provider == "gemini" and settings.GEMINI_API_KEY:
            api_key = settings.GEMINI_API_KEY
        elif provider == "openai" and settings.OPENAI_API_KEY:
            api_key = settings.OPENAI_API_KEY
        elif provider == "mistral" and settings.MISTRAL_API_KEY:
            api_key = settings.MISTRAL_API_KEY
        elif provider == "groq" and settings.GROQ_API_KEY:
            api_key = settings.GROQ_API_KEY
            
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chatbot is currently offline: Admin has not configured the LLM API Key."
        )

    # 2. Build RAG Context
    services_col = get_services_col()
    locations_col = get_locations_col()
    offers_col = get_offers_col()
    
    # Load data from DB
    services = list(services_col.find())
    locations = list(locations_col.find())
    offers = list(offers_col.find())
    
    # Static info
    clinic_hours = "Monday to Sunday, 10:00 AM to 8:00 PM"
    contact_phone = "9994390069"
    contact_email = "info@aglowaesthetics.com"
    
    # Format Services
    services_str = ""
    for s in services:
        services_str += f"- {s.get('name')}: {s.get('description')} (Price: to be updated/disclosed during consultation)\n"
    if not services_str:
        services_str = "- Korean Glass Skin Facials, HIFU Lifting, RF Microneedling, Exosome Regeneration, Injectables, Lasers.\n"
        
    # Format Locations
    locations_str = ""
    for l in locations:
        locations_str += f"- {l.get('name')}: {l.get('address')} (Google Maps directions: /location)\n"
    if not locations_str:
        locations_str = "- Puzhuthivakkam Branch: Sapthagiri Nagar, Inner Ring Road, Puzhuthivakkam, Chennai - 600091\n"
        
    # Format Offers (active ones)
    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    offers_str = ""
    for o in offers:
        if o.get("start_date", "") <= today <= o.get("end_date", ""):
            offers_str += f"- {o.get('title')}: {o.get('discount')} - {o.get('description')} (Promo Code: {o.get('promo_code', 'N/A')}, Valid till: {o.get('end_date')})\n"
    if not offers_str:
        offers_str = "- Grand Opening Special: 20% off your first session with promo code AGLOW20\n"

    # Assemble context block
    context = f"""
Official Info for Aglow Aesthetics Clinic:
Working Days & Hours: {clinic_hours}
Phone Number: {contact_phone}
Email Address: {contact_email}

Our Branches & Locations:
{locations_str}

Our Signature Services & Treatments:
{services_str}

Active Special Offers & Discounts:
{offers_str}
"""

    system_prompt = f"""You are the Aglow Aesthetics Chatbot, a friendly, luxurious, and professional AI skin consultant.
Your purpose is to answer customer questions about our skin services, clinic locations, working days, hours, and active offers.

Here is the official information regarding Aglow Aesthetics:
---
{context}
---

Rules:
1. Base your answers strictly on the official information provided above. Do not hallucinate treatments or schedules.
2. Maintain a highly polite, warm, and premium brand voice (reflecting a luxury Korean skincare clinic).
3. Keep responses relatively concise and focused on helping the customer book a consultation.
4. If a user asks about something outside this context (e.g. medical queries, non-skin treatments, or specific pricing not mentioned), state that you do not have that detail, and invite them to fill out the Enquiry Form at `/enquiry` or call our front desk at {contact_phone} so our specialists can guide them.
5. You can refer to pages like `/services`, `/offers`, `/location`, and `/enquiry` to guide users.
"""

    # 3. Call the LLM Provider
    try:
        if provider == "openai":
            model_name = "gpt-4o-mini"
        elif provider == "mistral":
            model_name = "mistral/mistral-small-latest"
        elif provider == "groq":
            model_name = "groq/llama3-8b-8192"
        else:
            model_name = "gemini/gemini-2.5-flash"

        messages = [{"role": "system", "content": system_prompt}]
        for h in request.history[-6:]:
            role = h.get("role", "user")
            if role == "model":
                role = "assistant"
            messages.append({"role": role, "content": h.get("content")})
        messages.append({"role": "user", "content": request.message})

        response = litellm.completion(
            model=model_name,
            messages=messages,
            api_key=api_key,
            temperature=0.7,
            max_tokens=250
        )
        reply = response.choices[0].message.content
        return {"reply": reply, "model": model_name}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with LLM ({provider}): {str(e)}"
        )

# Endpoint for Master Admin to save LLM settings
@router.post("/settings")
def save_llm_settings(
    request: LLMSettingsSave,
    current_user: dict = Depends(RoleChecker(["master_admin"]))
):
    if request.provider not in ["gemini", "openai", "mistral", "groq"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid LLM Provider. Must be 'gemini', 'openai', 'mistral', or 'groq'"
        )
        
    settings_col = get_settings_col()
    settings_col.update_one(
        {"key": "llm_settings"},
        {
            "$set": {
                "provider": request.provider,
                "api_key": request.api_key,
                "updated_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
        },
        upsert=True
    )
    
    selected_model = "gemini-2.5-flash"
    if request.provider == "openai":
        selected_model = "gpt-4o-mini"
    elif request.provider == "mistral":
        selected_model = "mistral-small-latest"
    elif request.provider == "groq":
        selected_model = "llama3-8b-8192"
        
    return {
        "message": f"LLM settings saved. Selected model: {selected_model}",
        "provider": request.provider,
        "model": selected_model
    }

@router.get("/settings")
def get_llm_settings(current_user: dict = Depends(RoleChecker(["master_admin"]))):
    settings_col = get_settings_col()
    llm_settings = settings_col.find_one({"key": "llm_settings"})
    
    if not llm_settings:
        return {"provider": "gemini", "api_key": "", "configured": False}
        
    # Mask API key for security
    api_key = llm_settings.get("api_key", "")
    masked_key = ""
    if api_key:
        masked_key = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "******"
        
    return {
        "provider": llm_settings.get("provider", "gemini"),
        "api_key": masked_key,
        "configured": True
    }
