# LocalCent - Phase 6: Auto-Categorization & UI Refinement

### Context
Phases 1 through 5 are complete. We have a working monorepo with webhooks ingesting SMS data, a frontend dashboard displaying metrics, and an AI analysis engine powered by external LLM APIs. Currently, all new transactions default to "Uncategorized".

### Objective
Build a rule-based auto-categorization engine that tags incoming transactions (e.g., "Zomato" -> "Food & Dining"). Create a UI mechanism for the user to manually correct categories, which will simultaneously "teach" the system by saving a new rule for future transactions.

---

### Task 1: Category Rule Database Model
In `backend/api/models.py`:
1.  Create a new model `CategoryRule`.
2.  Fields: `merchant_substring` (Char, unique, e.g., "zomato", "uber", "amazon"), `category` (Char).
3.  Generate and run the Django migrations for this new model.

---

### Task 2: The Auto-Tagging Engine (Backend)
In `backend/api/services.py` (updating the logic from Phase 3):
1.  Create a function `assign_category(merchant_name)`.
2.  Convert `merchant_name` to lowercase.
3.  Query the `CategoryRule` table. If any `merchant_substring` is found within the incoming `merchant_name`, return that category.
4.  If no match is found, return `"Uncategorized"`.
5.  Update the webhook ingestion logic to call `assign_category()` right before saving a new `Transaction` to the database.

---

### Task 3: Transaction Update Endpoint (Backend)
In `backend/api/views.py` and `backend/api/urls.py`:
1.  Create a `PATCH /api/transactions/<id>/` endpoint.
2.  It should accept a payload like: `{"category": "Transport", "create_rule": true}`.
3.  Update the `Transaction` with the new category.
4.  If `create_rule` is true, extract a clean substring from the transaction's `merchant_name` and save it to the `CategoryRule` table so future transactions from this merchant are auto-categorized.

---

### Task 4: Interactive Categories in the UI (Frontend)
In `frontend/src/features/transactions/RecentTransactions.jsx`:
1.  Update the transaction list row. Convert the static category text into a `<select>` dropdown menu with predefined options (e.g., Food, Transport, Utilities, Shopping, Salary, Uncategorized).
2.  When the user changes the dropdown value, fire a `PATCH` request to the backend using the API client.
3.  Show a small toast notification or inline checkmark indicating the transaction was updated and the rule was saved.
4.  *UI Polish:* Add color-coded pill backgrounds to the categories (e.g., light blue for Utilities, light green for Salary) using Tailwind utility classes.

---

### Output Requirements
Please provide the updated `models.py`, the categorization logic in `services.py`, the new `PATCH` endpoint view, and the updated React component for interactive categories.
