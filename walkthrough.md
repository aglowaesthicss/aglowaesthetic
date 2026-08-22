# Walkthrough: Aglow Aesthetics Portal

I have implemented the complete Python backend and connected it to the React TanStack Start frontend with role-based access control, interactive LLM provider settings, the phone number initial password generator, dynamic page fetches, and an AI RAG chatbot widget.

## Accomplishments

### 1. Python FastAPI Backend
Built a structured FastAPI server inside the `backend/` directory:
- **Database (`db.py` & `main.py`)**: Asynchronously connects to MongoDB and seeds a default administrative owner (`admin@aglow.com` / `admin`) if the database is unpopulated.
- **Authentication (`auth.py` & `routes/auth.py`)**: Complete JWT verification middleware. Enforces custom role permissions and checks feature restrictions dynamically.
- **Client & Staff Management (`routes/users.py`)**:
  - Automatically seeds new clients using the **last 5 digits of their mobile phone number** as their initial password.
  - Automatically triggers a styled onboarding email to the client using **Resend** upon registration, providing their credentials and a direct portal login button.
  - Master Admin can review and revoke feature access permissions for `staff` and `client` roles.
- **Records & Log Tracking (`routes/records.py`)**:
  - Add/Update/Delete Service History, including prices, dates, comments, and direct **Cloudinary invoice upload integration**.
  - Track treatment session slots (mapping multi-slot dates and times).
- **Public & Admin Content APIs (`routes/content.py`, `routes/feedback.py`)**:
  - Serves dynamic listings for services, active offers, locations, and testimonials.
  - Handles public consult enquiries, saving leads and automatically routing alerting emails via Resend to all admins and staff containing the client's information.
  - Filters out expired offers dynamically based on the current UTC time.
  - Logs client feedback and complaints, and supports admin reply updates.
- **Chatbot AI RAG (`routes/chat.py`)**:
  - Features dynamic LLM settings: Head Admin can choose Google Gemini (`gemini-1.5-flash`) or OpenAI (`gpt-4o-mini`) and save their API key in MongoDB.
  - Implements In-Context RAG: pulls services, active offers, clinic hours, and branches directly from MongoDB to create the LLM prompt context for accurate answers.
- **Cron reminders (`routes/cron.py`)**:
  - An endpoint `/api/cron/send-reminders` searches for sessions scheduled for today and emails reminders with their appointment time. It toggles a `reminder_sent` flag on the session record to guarantee no client receives duplicates.

### 2. React TanStack Start Frontend
Connected and expanded the React application inside the `frontend/` directory:
- **Global Auth Provider (`frontend/src/lib/auth-context.tsx`)**: Controls user tokens and exposes `hasAccess(feature)` checks dynamically.
- **Header (`frontend/src/components/site/Header.tsx`)**: Integrates portal links. Hides links for revoked features if the logged-in user is a client, and toggles Login/Logout indicators.
- **Login (`frontend/src/routes/login.tsx`)**: Connects the form inputs directly to the `/api/auth/login` token endpoints.
- **Settings (`frontend/src/routes/settings.tsx`)**: Standard settings panel allowing users to reset their login passwords.
- **RAG Chatbot Widget (`frontend/src/components/site/ChatbotWidget.tsx`)**:
  - A premium-designed, glassmorphic chatbot bubble floating at the bottom right.
  - Features quick-action chips, typing animations, scroll tracking, and integrates with the backend API chat endpoint.
- **Dynamic Portal Dashboard (`frontend/src/routes/dashboard.tsx`)**:
  - **Master Admin Views**: Manage staff, manage clients (mobile seeding), toggles permissions, input LLM keys, edit treatments/offers/locations/testimonials, and reply to client reports.
  - **Staff Views**: Register clients, schedule sessions, log histories, and check public enquiries.
  - **Client Views**: View scheduled treatments, view service histories/invoices, check promotions, and submit feedback.
- **Public Pages (`services.tsx`, `offers.tsx`, `location.tsx`, `testimonials.tsx`, `enquiry.tsx`)**: Connected to fetch data from MongoDB dynamically, falling back to static structures if the API is offline to preserve design aesthetics.

---

## Folder Structure

```
Aglowaesthetics/
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Logins, user passwords reset
│   │   ├── users.py         # Seeding, staff CRUD, access controls
│   │   ├── records.py       # Services histories & multi-sessions
│   │   ├── content.py       # Dynamic services, offers, map, enquiries
│   │   ├── feedback.py      # Complains log and admin replies
│   │   ├── chat.py          # Gemini/OpenAI RAG chatbot API
│   │   └── cron.py          # Session reminder cron route
│   ├── requirements.txt     # Python backend dependencies
│   ├── config.py            # Environment configurations loader
│   ├── db.py                # MongoDB clients
│   ├── auth.py              # JWT token checkers & permissions
│   ├── email_utils.py       # Styled emails (Resend templates)
│   └── main.py              # FastAPI startup seeder
└── frontend/
    ├── src/
    │   ├── components/site/
    │   │   ├── Header.tsx   # Auth-aware navigation toggles
    │   │   └── ChatbotWidget.tsx  # Floating chatbot widget
    │   ├── lib/
    │   │   ├── api.ts       # Axios-like JWT fetch client
    │   │   └── auth-context.tsx  # Global Auth Context Provider
    │   └── routes/
    │       ├── __root.tsx   # Globally hooks AuthProvider & Chatbot
    │       ├── login.tsx    # Connects credential token signins
    │       ├── settings.tsx # Reset password Settings
    │       ├── dashboard.tsx# Tabbed staff, admin, and client panels
    │       ├── services.tsx # Dynamic treatments loader
    │       ├── offers.tsx   # Dynamic offers with dates filter
    │       ├── location.tsx # Dynamic branches Google maps lists
    │       ├── testimonials.tsx # Dynamic testimonial streams
    │       └── enquiry.tsx  # Dynamic enquiry form submission
```

---

## Verification Results

### Frontend Compilation
We executed `npm run build` in the `frontend` folder. The compiler finished successfully with code `0`, confirming:
- No TypeScript type compiler errors.
- Successful routing tree generation.
- Correct integration of Vite assets and presets.

### Home Page Images Fix
- Fixed the 404 errors on the Home page (`frontend/src/routes/index.tsx`) where local asset placeholders (e.g. `clinic-interior.png`, `exosome-therapy.jpg`, etc.) were failing to load.
- Replaced these static placeholder references with dynamic fetches from the backend database (via `/api/content/about` and `/api/content/services` endpoints), utilizing the exact same Cloudinary URLs used on the About Us and Services pages.

