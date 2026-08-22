# Implementation Plan - Aglow Aesthetics

Implement a Python backend using FastAPI, MongoDB, Cloudinary, and Resend, and connect it to a TanStack Start/React frontend. The system includes role-based access control, settings, client details feeding, session tracking, service history, chatbot RAG, and automated emails.

## User Review Required

> [!IMPORTANT]
> The Python backend requires the following configuration parameters. We will create a `.env.template` file for these:
> - **MongoDB URI**: Connection string to the database (can be MongoDB Atlas).
> - **Cloudinary URL**: For hosting and uploading images (services, testimonials) and invoices.
> - **Resend API Key**: For email notifications (welcoming clients, new offers, session reminders, and new enquiry notifications).
> 
> *Note:* The LLM Provider and LLM API Key will be managed dynamically via the Master Admin Dashboard settings and stored in MongoDB.

> [!WARNING]
> Please review the role permissions. Master Admin (Founder/Owner) has complete access. Staff (Front Office) can add/update clients, sessions, and histories. Clients can only view their sessions, histories, and submit feedback. Access control allows Master Admin to toggle feature access for both Client and Staff roles dynamically.

## Open Questions

- *Are there other specific email templates or styling guidelines you would like for the Resend emails?* (We will use a luxurious gold and charcoal brand styling in HTML for the emails).

---

## Proposed Changes

### Backend Setup

#### [NEW] [requirements.txt](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/requirements.txt)
Define the Python dependencies for the FastAPI application:
- `fastapi` & `uvicorn[standard]`
- `pymongo` (MongoDB driver)
- `resend` (Email SDK)
- `cloudinary` (Image Upload SDK)
- `google-generativeai` (Gemini SDK for Chatbot)
- `openai` (OpenAI SDK for Chatbot)
- `python-jose[cryptography]` & `passlib[bcrypt]` (JWT authentication & password hashing)
- `pydantic` & `pydantic-settings` (Environment configuration and schemas)
- `python-multipart` (For file uploads)

#### [NEW] [config.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/config.py)
Configuration settings loader utilizing `pydantic-settings` to parse environments such as `MONGODB_URI`, `CLOUDINARY_URL`, `RESEND_API_KEY`, and `JWT_SECRET`.

#### [NEW] [db.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/db.py)
Establish connection to MongoDB and define collections helper.

#### [NEW] [auth.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/auth.py)
Helper utilities for hashing passwords, generating JWT tokens, and dependencies for extracting current user and checking their role permissions.

#### [NEW] [main.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/main.py)
Entry point of the FastAPI application. Includes CORS middleware configuration, routes routing, and error logging wrapper.

---

### Backend API Routes

#### [NEW] [auth_routes.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/auth.py)
Endpoints for:
- Login (`/api/auth/login`) - returns JWT token and user info.
- Reset/change password in settings (`/api/auth/change-password`) - allows users to change their own password.
- Admin update user password anytime (`/api/auth/update-password-admin`) - Master Admin resets any user's password.
- Get current user profile (`/api/auth/me`).

#### [NEW] [users.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/users.py)
Endpoints for:
- Creating Staff/Admins (`/api/users/staff` - only Master Admin).
- Creating Clients (`/api/users/client` - Master Admin and Staff/Front Office).
  - Automatically extracts the **last 5 digits of the client's phone number** and sets it as their initial password (hashed).
  - Triggers Resend welcome email with their login credentials (email & temporary password) and a Login link.
- Listing/Updating users (`/api/users`).
- Managing Access Control (`/api/users/access-control` - get/set role-based feature permissions).

#### [NEW] [records.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/records.py)
Endpoints for:
- Service History (`/api/records/history`):
  - View histories: Clients get their own; Staff/Master Admin get all.
  - Add/Update: Head Admin or Front Office.
  - Delete: Head Admin only.
- Session Tracking (`/api/records/sessions`):
  - View sessions: Clients see their next session.
  - Add/Update: Head Admin or Front Office.
  - Delete: Head Admin only.

#### [NEW] [content.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/content.py)
Endpoints for managing dynamic clinic content (public + admin):
- Services (`/api/content/services`):
  - Clients & Public view.
  - Add/Update/Delete: Head Admin. Supports Cloudinary image upload.
- Offers (`/api/content/offers`):
  - Clients & Public view (filtered to ensure expired offers are hidden).
  - Add/Update/Delete: Head Admin. Triggers email to all clients when a new offer is created.
- Locations (`/api/content/locations`):
  - Clients & Public view.
  - Add/Update/Delete: Head Admin.
- Testimonials (`/api/content/testimonials`):
  - Clients & Public view.
  - Add/Update/Delete: Head Admin. Supports text, image, Instagram/Youtube links.
- Enquiries (`/api/content/enquiries`):
  - Submit enquiry: Public form. Triggers email notification via Resend with all details (Name, Phone, Email, Location, Service) sent to Head Admin and all Staff members.
  - View/Manage: Staff and Master Admin.

#### [NEW] [feedback.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/feedback.py)
Endpoints for Feedback and Complaints:
- Submit feedback/complaint (`/api/feedback` - Client).
- View feedback list (`/api/feedback` - Head Admin/Staff).
- Reply/Response (`/api/feedback/{id}/reply` - Head Admin only).

#### [NEW] [chat.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/chat.py)
Chatbot LLM endpoint:
- `/api/chat` handles message requests.
- Implements In-Context RAG: pulls services, locations, active offers, and clinic hours/working days from database, formats it into prompt context.
- Fetches LLM provider selection and API key from database. Uses `gemini-1.5-flash` for Gemini, and `gpt-4o-mini` for OpenAI.

#### [NEW] [cron.py](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/backend/routes/cron.py)
Trigger daily session reminder checks via email (`/api/cron/send-reminders`). Can be called by Vercel cron jobs or render cron trigger.

---

### Frontend Components & Pages

#### [NEW] [api.ts](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/lib/api.ts)
Universal API client helper for Axios/fetch requests. Automatically attaches JWT tokens from localStorage and handles authentication failures (redirect to login).

#### [NEW] [auth-context.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/lib/auth-context.tsx)
React Context provider to store current user credentials, roles, loading states, login/logout handlers, and permission check helpers.

#### [MODIFY] [Header.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/components/site/Header.tsx)
Modify header navigation links dynamically:
- Add portal navigation. If logged in, display "Dashboard" and "Logout". If not, display "Login".

#### [MODIFY] [__root.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/__root.tsx)
- Wrap root in AuthProvider.
- Embed the Chatbot Floating Widget in the bottom-right corner of the layout, making it accessible on all pages.

#### [NEW] [ChatbotWidget.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/components/site/ChatbotWidget.tsx)
A premium-designed, floating chat widget with glassmorphism styling, clean animations, automatic scrolling, suggestions chips, and an elegant conversational interface.

#### [MODIFY] [login.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/login.tsx)
Connect the existing login form to backend `/api/auth/login`. On success, store token, update Auth Context, and redirect to `/dashboard`.

#### [NEW] [dashboard.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/dashboard.tsx)
Add `/dashboard` route. This is the main client & admin panel, which splits UI into tabs based on permissions and role:
- **Master Admin Controls**:
  - Staff & Admin Management
  - Client Management (includes phone number input to generate the temporary password using the last 5 digits)
  - Feature Access Control Panel (Revoke/Grant feature list for client/staff roles)
  - LLM Provider Settings (select Gemini or OpenAI, input API Key; backend automatically selects `gemini-1.5-flash` or `gpt-4o-mini`)
  - Content Management (Services, Offers, Locations, Testimonials CRUD)
  - Record Management (Service History, Sessions CRUD)
  - Feedback/Complaints list with reply dialogs
  - Enquiry Details Display list (view details of all submitted public enquiries)
- **Staff Controls**:
  - Client Creation & Details Update (uses phone number rule for password generation)
  - Record Management (Service History, Sessions Add/Update)
  - Enquiry Details Display list (view details of all submitted public enquiries)
  - Permitted content features (Services, Offers, Locations, etc.)
- **Client Controls**:
  - Sessions (view upcoming session with date/time details)
  - Service History (view history list and access invoices)
  - Submit Feedback & Complaints form
  - Access Control settings tab (Change Password)

#### [NEW] [settings.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/settings.tsx)
Add `/settings` route for simple profile settings. Allows any logged-in user to reset their password.

#### [MODIFY] [services.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/services.tsx)
#### [MODIFY] [offers.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/offers.tsx)
#### [MODIFY] [location.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/location.tsx)
#### [MODIFY] [testimonials.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/testimonials.tsx)
#### [MODIFY] [enquiry.tsx](file:///c:/Users/CFRSI%204/Downloads/Aglowaesthetics/src/routes/enquiry.tsx)
Connect these pages to the backend REST API endpoints to load data dynamically from MongoDB. Include loading skeletons and smooth transitions, falling back gracefully to static mock data if the API fails or is not connected.

---

## Verification Plan

### Automated Tests
- Test backend endpoints with a Python script or cURL requests.
- Verify JWT auth tokens are generated and validated correctly.
- Test LLM prompt composition and response rendering.

### Manual Verification
- Test user flows:
  1. Login as Master Admin.
  2. Create a Staff user. Log out, log in as Staff.
  3. Create a Client user (e.g., phone `9994390069`). Verify welcome email is sent with the temporary password `90069`.
  4. Log in as Client with temporary password. Verify prompt to update password.
  5. Go to Admin Settings, input Gemini API key and select Gemini. Chat with the bot and verify it responds. Switch to OpenAI, input key, and test bot response.
  6. Create a new Offer. Verify email notifications are sent.
  7. Revoke access to "Offers" for Client role via Master Admin Access Control panel.
  8. Log in as Client. Confirm "Offers" page/tab is hidden and direct URL returns 403 Forbidden.
  9. Submit a public enquiry. Verify that Head Admin and Staff receive an email notification containing Name, Phone, Email, Location, and Service. Confirm that the enquiry appears in their dashboards.
  10. Ask chatbot about clinic working hours, service list, locations, and test RAG context injection.
