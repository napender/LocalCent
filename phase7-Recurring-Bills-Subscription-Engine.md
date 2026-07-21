# LocalCent - Phase 7: Recurring Bills & Subscription Engine

### Context
Phases 1 through 6 are complete. The app now ingests transactions, categorizes them automatically, and provides AI analysis. We are now building the recurring bills engine to track fixed expenses (like Netflix, Rent, Gym memberships, or Credit Card bill cycles) and forecast upcoming charges.

### Objective
Implement the logic to detect and manage recurring bills, create the necessary CRUD API endpoints, and build the `<UpcomingBills />` React component to warn the user about impending charges on their dashboard.

---

### Task 1: The Auto-Detection Engine (Backend)
In `backend/api/services.py`:
1.  Create a function `scan_for_recurring_bills()`.
2.  **Logic:** Group recent `DEBIT` transactions by `merchant_name`. If a merchant has a transaction of the exact same (or very similar) amount occurring roughly 28-31 days apart for at least two consecutive months, it is a candidate.
3.  If a candidate is found, check if it already exists in the `RecurringBill` table. If not, create a new `RecurringBill` with `is_auto_detected=True`, `frequency="MONTHLY"`, and estimate the `next_due_date` by adding 30 days to the last transaction date.

---

### Task 2: Bills API Endpoints (Backend)
In `backend/api/views.py` and `backend/api/urls.py`:
1.  Create `GET /api/bills/`: Returns all active recurring bills, ordered by `next_due_date` ascending.
2.  Create `POST /api/bills/`: Allows the user to manually add a fixed expense (e.g., Rent) that might not be easily auto-detected.
3.  Create `POST /api/bills/scan/`: An endpoint to manually trigger the `scan_for_recurring_bills()` function.
4.  **Payment Status Logic:** When fetching the bills in the `GET` request, the backend should dynamically check the `Transaction` table for the current month. If a transaction matching the bill's merchant and approximate amount exists in the current month, append a boolean `is_paid_this_month: true` to the JSON response.

---

### Task 3: Upcoming Bills UI (Frontend)
In `frontend/src/features/dashboard/UpcomingBills.jsx`:
1.  Fetch data from `GET /api/bills/` on mount.
2.  Build a clean list interface showing the `merchant_name`, `expected_amount`, and `next_due_date`.
3.  **Visual Indicators:**
    *   If `is_paid_this_month` is true, gray out the text and add a green "Paid" badge or strikethrough.
    *   If the bill is due within the next 5 days and is unpaid, highlight the due date in red/orange to grab the user's attention.
4.  Include a small "Scan for Subscriptions" button at the top of the component that hits the `/api/bills/scan/` endpoint and refreshes the list.
5.  Add a "+" button to open a simple modal form for manually adding a fixed expense.

---

### Output Requirements
Please provide the Python script for `scan_for_recurring_bills()`, the Django views for the bills endpoints, and the React code for the `UpcomingBills.jsx` component. Ensure the UI clearly differentiates between paid and pending bills.
