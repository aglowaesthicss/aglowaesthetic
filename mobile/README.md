# Aglow Aesthetics Flutter App

This is the mobile client for Aglow Aesthetics Korean Skincare Clinic portal, built using Flutter.

## Features Included
* **Guest navigation**: Home, services catalog, active campaigns, testimonials, maps location directions, and consultation form bookings.
* **Offline-first caching**: Instant screen loads using `shared_preferences` that dynamically revalidate from the backend when connected.
* **Global Auth & Role-based Panels**: Custom tabs and pages for **Admin** (LLM chatbot configurations, access toggle checkboxes, reports replies), **Staff** (client registrations, slotted session bookings, treatment history logging), and **Clients** (sessions view, completed history invoices, and feedback reports).
* **Floating AI Chatbot**: Conversational Sparkles FAB matching the web chatbot experience.

---

## How to Build and Run

### Prerequisite
Install the Flutter SDK on your development machine by following the official guide: [flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)

### Setup Commands
Navigate to the `mobile` directory in your terminal and execute:

1. **Install dependencies**:
   ```bash
   flutter pub get
   ```

2. **Configure API URL**:
   Open [`lib/services/api.dart`](file:///c:/Users/CFRSI%204/Downloads/aglowaesthetic-alpha-v1/mobile/lib/services/api.dart) and configure `productionUrl` with your Render backend server URL.

3. **Run the application**:
   Make sure you have an Android Emulator, iOS Simulator, or physical device connected, and run:
   ```bash
   flutter run
   ```

4. **Build APK (Android production bundle)**:
   ```bash
   flutter build apk --release
   ```

5. **Build IPA (iOS production bundle)**:
   ```bash
   flutter build ipa --release
   ```
