# Project Name: [Insert Chosen Name Here]
## A Privacy-First, AI-Powered Local Family Finance Dashboard

### 1. Project Overview
This project is a localhost-only, privacy-first personal finance dashboard. It automatically ingests financial transactions via mobile SMS and email, deduplicates them, and provides a centralized family dashboard. It integrates with external LLM APIs (ChatGPT, Claude, DeepSeek) for on-demand financial analysis while keeping the core database strictly on the local home network.

### 2. Tech Stack
*   **Architecture:** Monorepo (Frontend and Backend in one root repository)
*   **Backend:** Django (Python) + Django REST Framework / Django Ninja
*   **Frontend:** React.js (Bootstrapped via Vite), Tailwind CSS for styling
*   **Database:** SQLite (Zero-dependency, local file)
*   **Background Tasks:** Huey (Lightweight task queue using SQLite)
*   **Networking:** Vite proxy to Django, bound to `0.0.0.0` for local Wi-Fi access

### 3. Core Features & Logic
*   **Family Auth:** PIN-based local authentication. Stores session in `localStorage`. Differentiates between Admin and standard users.
*   **Data Ingestion:**
    *   **Android SMS:** Webhook endpoint receiving HTTP POST requests from Tasker/SMSGate.
    *   **iOS SMS:** Webhook endpoint receiving HTTP POST requests from Apple Shortcuts.
    *   **Email:** Background IMAP polling task to fetch, decrypt (using predefined PDF passwords), and parse bank emails.
*   **Smart Deduplication:** 
    *   Hash generator using `Date (rounded to hour) + Amount + Account`. Drops incoming data if the hash already exists.
*   **AI Integration:**
    *   User can provide an API key in the UI settings.
    *   1-click actions ("Analyze last month", "Trend analysis").
    *   Backend aggregates raw SQLite transactions into a compressed JSON payload and injects it into a strict system prompt before sending it to the LLM.

### 4. Required Folder Structure
```text
root/
├── backend/                  # Django project
│   ├── core/                 # Django settings (CORS bypassed via Vite proxy)
│   ├── api/                  # Endpoints: /api/auth/, /api/sms/, /api/ai/
│   ├── db.sqlite3            
│   └── manage.py
├── frontend/                 # React (Vite) project
│   ├── src/                  
│   │   ├── context/          # FamilyAuthContext.jsx
│   │   ├── features/         # Grouped by: dashboard, transactions, ai-analysis
│   │   ├── pages/            # Login.jsx, Dashboard.jsx
│   │   └── App.jsx           
│   └── vite.config.js        # Configured to proxy /api to [http://127.0.0.1:8000](http://127.0.0.1:8000)
└── .gitignore
