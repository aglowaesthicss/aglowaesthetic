import os
import pytest
import litellm
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Helper to get configured keys from MongoDB settings
def get_key_and_provider_db():
    try:
        db_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        client = MongoClient(db_uri)
        db = client[os.getenv("DB_NAME", "aglow_aesthetics")]
        settings_col = db["settings"]
        llm_settings = settings_col.find_one({"key": "llm_settings"})
        if llm_settings:
            return llm_settings.get("provider"), llm_settings.get("api_key")
    except Exception:
        pass
    return None, None

def test_gemini_key():
    db_provider, db_key = get_key_and_provider_db()
    
    # Resolve Gemini key
    gemini_key = None
    if db_provider == "gemini" and db_key:
        gemini_key = db_key
    else:
        gemini_key = os.getenv("GEMINI_API_KEY")
        
    if not gemini_key:
        pytest.skip("Gemini API Key is not configured.")
        
    try:
        response = litellm.completion(
            model="gemini/gemini-3.5-flash",
            messages=[{"role": "user", "content": "Ping"}],
            api_key=gemini_key,
            max_tokens=5
        )
        assert response is not None
        assert len(response.choices) > 0
    except Exception as e:
        pytest.fail(f"Gemini Key validation failed: {e}")

def test_openai_key():
    db_provider, db_key = get_key_and_provider_db()
    
    # Resolve OpenAI key
    openai_key = None
    if db_provider == "openai" and db_key:
        openai_key = db_key
    else:
        openai_key = os.getenv("OPENAI_API_KEY")
        
    if not openai_key:
        pytest.skip("OpenAI API Key is not configured.")
        
    try:
        response = litellm.completion(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Ping"}],
            api_key=openai_key,
            max_tokens=5
        )
        assert response is not None
        assert len(response.choices) > 0
    except Exception as e:
        pytest.fail(f"OpenAI Key validation failed: {e}")

def test_mistral_key():
    db_provider, db_key = get_key_and_provider_db()
    
    # Resolve Mistral key
    mistral_key = None
    if db_provider == "mistral" and db_key:
        mistral_key = db_key
    else:
        mistral_key = os.getenv("MISTRAL_API_KEY")
        
    if not mistral_key:
        pytest.skip("Mistral API Key is not configured.")
        
    try:
        response = litellm.completion(
            model="mistral/mistral-small-latest",
            messages=[{"role": "user", "content": "Ping"}],
            api_key=mistral_key,
            max_tokens=5
        )
        assert response is not None
        assert len(response.choices) > 0
    except Exception as e:
        pytest.fail(f"Mistral Key validation failed: {e}")

def test_groq_key():
    db_provider, db_key = get_key_and_provider_db()
    
    # Resolve Groq key
    groq_key = None
    if db_provider == "groq" and db_key:
        groq_key = db_key
    else:
        groq_key = os.getenv("GROQ_API_KEY")
        
    if not groq_key:
        pytest.skip("Groq API Key is not configured.")
        
    try:
        response = litellm.completion(
            model="groq/llama3-8b-8192",
            messages=[{"role": "user", "content": "Ping"}],
            api_key=groq_key,
            max_tokens=5
        )
        assert response is not None
        assert len(response.choices) > 0
    except Exception as e:
        pytest.fail(f"Groq Key validation failed: {e}")
