# LocalCent - Phase 8: Credit Card Statements & Billing Cycles

### Context
Phases 1 through 7 are complete. The app handles SMS transactions, recurring bills, AI analysis, and auto-categorization. The final core requirement is handling locked credit card statements sent via email and tracking their specific billing cycles.

### Objective
Build a PDF extraction engine to decrypt and parse credit card statements entirely in memory. Connect this to the background email fetcher, and create a UI to manage card passwords and billing cycle dates.

---

### Task 1: Account Model Updates
In `backend/api/models.py`:
1.  Ensure the `Account` model has the following fields: `pdf_password` (Char), `statement_day` (Integer, 1-31), and `due_day` (Integer, 1-31).
2.  Run Django migrations for these updates.

---

### Task 2: PDF Decryption & Parsing Engine (Backend)
In a new file `backend/api/pdf_parser.py`:
1.  **Dependencies:** Use `pdfplumber` (great for extracting tables from PDFs) or `PyPDF2`.
2.  Create a function `process_statement_pdf(file_bytes, password)`.
3.  **Logic:** 
    *   Attempt to decrypt the PDF in memory using the provided password.
    *   Extract the text/tables.
    *   Write a regex or heuristic fallback to find rows containing a date, a merchant string, and an amount.
    *   Return a list of parsed dictionaries: `[{"date": "...", "merchant": "...", "amount": 500, "type": "DEBIT"}]`.

---

### Task 3: Email IMAP Worker Integration (Backend)
In `backend/api/services.py` (or a dedicated `email_worker.py`):
1.  Create a function `fetch_and_process_emails()`.
2.  Connect to Gmail via IMAP using an App Password.
3.  Search for unread emails from known bank addresses (e.g., `statements@hdfcbank.com`, `alerts@icicibank.com`) with PDF attachments.
4.  Download the attachment into memory (do not save to disk).
5.  Iterate through the `Account` models in the database. Try to open the PDF using each account's `pdf_password`.
6.  Once successfully opened and parsed via `process_statement_pdf()`, pass the extracted transactions through the Phase 3 Deduplication engine to ensure you don't save transactions already captured via SMS.

---

### Task 4: Billing Cycle Forecasting (Backend)
In `backend/api/services.py` (updating the Dashboard Summary from Phase 4):
1.  Create a function `get_credit_card_summaries()`.
2.  For each credit card `Account`, calculate the current billing cycle (e.g., if `statement_day` is the 15th, the cycle is 16th of last month to 15th of this month).
3.  Sum the `DEBIT` transactions within that exact date range to show the "Unbilled Amount" or "Current Statement Balance".

---

### Task 5: Card Management UI (Frontend)
In `frontend/src/features/settings/CardManagement.jsx`:
1.  Build a CRUD interface to manage `Account` records.
2.  Allow the user to enter the `bank_name`, `last_four_digits`, `statement_day`, `due_day`, and `pdf_password`.
3.  Mask the `pdf_password` field (like a standard password input) so it isn't visible on the screen.
4.  *Dashboard Update:* On the main `Dashboard.jsx`, add a small widget below "Upcoming Bills" called "Credit Cards". Display each card's unbilled amount and a countdown to the `due_day`.

---

### Output Requirements
Please provide the Python code using `pdfplumber` or `PyPDF2` for decrypting and parsing the PDF, the IMAP email fetching logic, and the React code for the `CardManagement.jsx` settings page. Note: Ask for permission before running the `pip install pdfplumber` command.
