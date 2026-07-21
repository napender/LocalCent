# LocalCent - Phase 3: Transaction Ingestion & Deduplication

### Context
Phases 1 and 2 are complete. The database models (including `Transaction` and `Account`) and local PIN authentication are working. The next critical piece is opening up the local webhooks to receive SMS data from the iOS Shortcuts and Android Tasker apps, and implementing the deduplication engine.

### Objective
Build the Django webhook endpoints to receive incoming transaction data, apply a SHA-256 deduplication hash based on the timestamp and amount, save unique records to the database, and build a simple React component to verify the incoming data.

---

### Task 1: Deduplication & Parsing Utility
In a new file `backend/api/services.py` (or `utils.py`):
1.  **Deduplication Hash Generator:** Write a function `generate_transaction_hash(amount, date_time, account_last_4)`. 
    *   It should round the `date_time` down to the nearest hour (to account for slight delays between SMS and email).
    *   It should concatenate the values into a single string.
    *   It should return a SHA-256 hash of that string.
2.  **Basic SMS Parser:** Write a lightweight function `parse_sms_text(message_body)`.
    *   Use regex to extract the `amount` (looking for INR, Rs., Rs, etc.).
    *   Determine if it's a `CREDIT` or `DEBIT` (looking for keywords like "debited", "credited", "spent").
    *   Extract a rough `merchant_name` (e.g., text following "at", "to", "info").
    *   *(Note: This parser doesn't need to be perfect yet; we will refine it with AI later. It just needs to extract the amount and type for now).*

---

### Task 2: Webhook API Endpoints
In `backend/api/views.py` and `backend/api/urls.py`:
1.  Create `POST /api/webhooks/sms/` (this can serve both iOS and Android if the payload is standard).
2.  **Security bypass:** Use `@csrf_exempt` and `@api_view(['POST'])` (if using DRF) because this endpoint will be hit by external phone scripts, not the React frontend.
3.  **Payload Expectation:** `{"sender": "Bank-Name", "message": "Rs. 500.00 debited from a/c X1234 at Zomato", "timestamp": "2026-07-21T10:00:00Z", "source": "SMS_IOS"}`
4.  **Logic Flow:**
    *   Pass the message to `parse_sms_text()`.
    *   Look up the `Account` model using the last 4 digits (create a fallback/default account if not found).
    *   Generate the deduplication hash.
    *   Attempt to save the `Transaction`. If an `IntegrityError` is thrown due to the unique hash, gracefully catch it, ignore the duplicate, and return `200 OK {"status": "duplicate ignored"}`.
    *   If successful, return `201 Created {"status": "success"}`.

---

### Task 3: API Endpoint for Frontend
In `backend/api/views.py`:
1.  Create a standard GET endpoint `GET /api/transactions/` that returns the 50 most recent transactions, ordered by timestamp descending.

---

### Task 4: React Recent Transactions UI
In `frontend/src/features/transactions/RecentTransactions.jsx`:
1.  Fetch data from `GET /api/transactions/` on mount (or use a library like SWR/React Query if preferred).
2.  Build a clean Tailwind list UI. Each row should show the `merchant_name`, date/time, and the `amount`. 
3.  Style DEBIT amounts in red (e.g., `- ₹500`) and CREDIT amounts in green (e.g., `+ ₹5,000`).
4.  If the array is empty, show an empty state: "Waiting for incoming transactions... Setup your iOS Shortcut or Android Tasker to point to your local IP."

---

### Task 5: Background IMAP Email Sync Engine (Huey)
In `backend/api/email_worker.py` and `backend/api/tasks.py`:
1.  **IMAP Sync Logic (`email_worker.py`):** Write a script that connects to an IMAP server (with auto-discovery for Gmail/Outlook/Yahoo) using credentials from `SystemSettings` (email & AES-encrypted app password).
2.  **PDF Parsing:** The worker should search for unread emails, extract PDF attachments (bank/credit card statements), and use `pdfplumber` to extract transaction rows.
3.  **Deduplication & Storage:** Extracted transactions must be run through the same deduplication hash logic and saved to the `Transaction` table.
4.  **Huey Task Scheduler (`tasks.py`):** Wrap the email worker logic in a `@db_periodic_task(crontab(minute='*/30'))` so it runs in the background every 30 minutes. Provide a manual `/api/settings/sync-email/` endpoint to trigger it immediately from the frontend.

---

### Output Requirements
Please provide the Python code for the deduplication/parsing logic, the Django views and URLs for the webhooks, and the React code for the `RecentTransactions.jsx` component.
