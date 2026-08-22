# Task List: Aglow Aesthetics Implementation

## Backend Implementation
- [x] Create `backend/requirements.txt` with FastAPI, MongoDB, Resend, Cloudinary, OpenAI, Gemini and other dependencies
- [x] Create `backend/config.py` for environment variables parsing
- [x] Create `backend/db.py` to establish the MongoDB connection
- [x] Create `backend/auth.py` for password hashing, JWT creation/decoding, and permission checker middleware
- [x] Implement backend API routes in `backend/routes/`:
  - [x] `auth.py`: logins, password change, admin password update
  - [x] `users.py`: Staff creation, Client creation (last 5 digits of mobile as temporary password, Resend welcome email), Access Control CRUD, Client Update, Client/Staff Delete
  - [x] `records.py`: Service History (Add/Update/Delete based on role), Session Tracking (Add/Update/Delete)
  - [x] `content.py`: Services, Offers (send notification email to all clients on creation, filter expired offers), Locations, Testimonials, and Public Enquiries (send notification emails to admin + staff)
  - [x] `feedback.py`: Feedback/complaints client submission and admin replies
  - [x] `chat.py`: In-Context RAG LLM integration with Gemini & OpenAI using saved DB keys
  - [x] `cron.py`: endpoint to check daily sessions and send reminder emails
- [x] Create `backend/main.py` to wire routes and CORS together
- [x] Initialize Cloudinary globally on startup in `main.py` to fix authentication upload issues
- [x] Implement GET, POST, and Image Upload endpoints for "About Us" content dynamically
- [x] Select `resource_type="raw"` dynamically when uploading PDF invoices to bypass default Cloudinary account viewer restrictions
- [x] Allow optional `Authorization` header reading for public offers endpoint to support logged-out users
- [x] Configure offers endpoint to only filter out expired promotions (checking `today <= end_date`), showing unstarted upcoming offers to visitors
- [x] Allow optional `Authorization` header reading for public locations and testimonials endpoints to support logged-out users
- [x] Force explicit `public_id` with correct extension format (e.g. `.pdf`) during invoice uploads to preserve correct browser viewer headers in Cloudinary links

## Frontend Integration
- [x] Create frontend universal API client in `src/lib/api.ts`
- [x] Create frontend authentication context in `src/lib/auth-context.tsx`
- [x] Modify `src/routes/__root.tsx` to wrap in AuthProvider and integrate the Chatbot Floating Widget
- [x] Create the premium Chatbot Widget component in `src/components/site/ChatbotWidget.tsx`
- [x] Connect the login form in `src/routes/login.tsx` to the backend
- [x] Create the settings route `/settings` in `src/routes/settings.tsx` for password changes
- [x] Implement the dashboard route `/dashboard` in `src/routes/dashboard.tsx` with role-based tabs:
  - [x] Master Admin View: Staff & Client CRUD, Access Control Panel, LLM Provider settings, content manager, records manager, feedback replies, enquiries list
  - [x] Staff View: Client CRUD, records manager (add/update), enquiries list
  - [x] Client View: Service History, Sessions tracking, Feedback submission, change password
- [x] Connect public pages (`services.tsx`, `offers.tsx`, `location.tsx`, `testimonials.tsx`, `enquiry.tsx`) to pull dynamically from backend API
- [x] Group treatments by category dynamically on services page
- [x] Add dynamic services Edit Modal in admin dashboard
- [x] Make service description and cover images optional in Add/Edit forms
- [x] Restructure admin sidebar navigation into "Manage Portal" and "Web Content" categories
- [x] Clear all hardcoded frontend static fallbacks and save a backup copy in `original_static_content_backup.md`
- [x] Implement dynamic About Us fetch inside `/about` route and add a dedicated "About Us Content" tab in the Admin Dashboard
- [x] Add Edit Client Details modal form and edit button in the Client List for admins and staff
- [x] Isolate services and offers fetching in `services.tsx` to prevent authentication/connection errors from blocking rendering

## Verification & Walkthrough
- [x] Test API endpoints locally
- [x] Create `walkthrough.md` with accomplishments and testing results
- [x] Build and compile the entire React TanStack Start app successfully
