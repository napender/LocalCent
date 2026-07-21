# LocalCent - Phase 9.3: PWA & UI Polish

### Context
Phases 1 through 9.2 are complete. The app is secure, deployed via PM2 on the macOS host, and data is automatically backed up. The final step is to improve the mobile user experience by converting the React Vite app into a Progressive Web App (PWA) so it can be installed on iOS and Android home screens, and to build a CSV data export feature.

### Objective
Configure Vite to output a PWA with offline caching, add iOS-specific meta tags for a full-screen native feel, and create a Django endpoint to export all transactions to a CSV file.

---

### Task 1: Vite PWA Plugin Setup
1.  **Dependency:** Install `vite-plugin-pwa` in the frontend directory (`npm install vite-plugin-pwa -D`).
2.  **Configuration:** Update `frontend/vite.config.js` to include the `VitePWA` plugin. 
3.  **Manifest:** Define the `manifest` object inside the plugin config with the app name ("LocalCent"), short name, theme color (e.g., `#ffffff`), background color, and an array of icon sizes (192x192 and 512x512). 

---

### Task 2: iOS-Specific Meta Tags & Offline State
Apple requires a few extra HTML tags to make PWAs feel truly native.
1.  **Index.html:** Add the following to `frontend/index.html`:
    *   `<meta name="apple-mobile-web-app-capable" content="yes">`
    *   `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
    *   Link an Apple Touch Icon (`<link rel="apple-touch-icon" href="...">`).
2.  **Offline Handling:** In `App.jsx`, add a simple network listener (`window.addEventListener('offline', ...)`). If the phone disconnects from the home Wi-Fi while the app is open, display a graceful full-screen overlay saying "You are currently disconnected from the home network" instead of letting API calls fail silently.

---

### Task 3: CSV Data Export (Backend)
To ensure the user is never locked out of their own data, build a simple export mechanism.
1.  **Django View (`backend/api/views.py`):** Create a `GET /api/export/transactions/` endpoint.
2.  **Logic:** Use Python's built-in `csv` module. Query all `Transaction` records (ordered by date descending). 
3.  **Response:** Return a `HttpResponse` with the `content_type='text/csv'` and the header `Content-Disposition: attachment; filename="localcent_transactions.csv"`.

---

### Task 4: Export UI (Frontend)
1.  In `frontend/src/features/settings/SettingsForm.jsx`, add a new section called "Data Management".
2.  Add an "Export Transactions (CSV)" button.
3.  When clicked, trigger a file download from the `/api/export/transactions/` endpoint (ensuring the `Authorization` header with the local session token is passed if required by the API client).

---

### Output Requirements
Please provide the updated `vite.config.js` file with the PWA plugin configuration, the necessary HTML tags for `index.html`, the Django view for the CSV export, and the React code for the download button.
