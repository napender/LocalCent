# LocalCent - Phase 4: Main Dashboard & Summary Metrics

### Context
Phases 1 through 3 are complete. The database is ingesting transactions via webhooks, deduplicating them securely, and local PIN authentication is fully operational. We are now building the core dashboard interface and the data aggregation endpoints.

### Objective
Create a context-aware backend API to calculate monthly metrics (Income, Expenses, Remaining Budget), build a robust API client in React to handle authentication headers automatically, and construct the responsive main dashboard layout.

---

### Task 1: API Client & Interceptor (Frontend)
In a new file `frontend/src/services/api.js`:
1.  Create a wrapper around the native `fetch` API (or configure an Axios instance).
2.  It must automatically read the `family_dashboard_user` object from `localStorage` and inject the local token/session ID into the `Authorization` header for every request.
3.  Implement global error handling: if any API call returns a `401 Unauthorized`, it should clear `localStorage` and force a redirect to the `/login` route.

---

### Task 2: Summary Metrics API (Backend)
In `backend/api/views.py` and `backend/api/urls.py`:
1.  Create a GET endpoint: `GET /api/dashboard/summary/`.
2.  It should accept optional query parameters for `month` and `year`. If missing, default to the current month.
3.  **Calculations:**
    *   Filter `Transaction` models by the target month and year.
    *   Sum all `CREDIT` transactions -> `total_income`.
    *   Sum all `DEBIT` transactions -> `total_spent`.
    *   Fetch the `monthly_budget_target` from the `SystemSettings` singleton model.
    *   Calculate `remaining_budget` = `monthly_budget_target - total_spent`.
4.  Return the aggregated data as a clean JSON response.

---

### Task 3: The Main Dashboard Layout (Frontend)
In `frontend/src/pages/Dashboard.jsx`:
1.  Implement a highly responsive layout using Tailwind CSS. 
2.  **Mobile View:** Use a simple top header (with the user's name from `FamilyAuthContext`) and a bottom tab navigation bar for future routing (Dashboard, Transactions, Settings).
3.  **Desktop View:** Convert the bottom navigation into a sleek left-hand sidebar. 
4.  The main content area should render the `<SummaryMetrics />` at the top and the `<RecentTransactions />` (from Phase 3) below it.

---

### Task 4: Summary Metrics UI (Frontend)
In `frontend/src/features/dashboard/SummaryMetrics.jsx`:
1.  Use the API client from Task 1 to fetch data from `/api/dashboard/summary/` on component mount.
2.  Build a 3-card grid layout using Tailwind:
    *   **Card 1 (Income):** Green accents, showing `total_income`.
    *   **Card 2 (Spent):** Red/Orange accents, showing `total_spent`.
    *   **Card 3 (Budget):** Blue/Indigo accents. Show the `remaining_budget`. Add a subtle progress bar underneath showing the percentage of the budget consumed.
3.  Ensure the cards stack vertically on small screens and sit side-by-side (grid-cols-3) on medium/large screens.
4.  Include a loading skeleton state while the `fetch` promise is resolving so the UI doesn't jump.

---

### Output Requirements
Please provide the code for the React `api.js` service, the Django dashboard summary view/URLs, the updated `Dashboard.jsx` layout, and the `SummaryMetrics.jsx` component.
