# LocalCent - Phase 2: Database Models & Local Authentication

### Context
Phase 1 (Scaffolding and Vite-to-Django proxy configuration) is complete. The project is named **LocalCent**. The backend is a Django app named `api`, and the frontend is a React Vite app using Tailwind CSS. 

### Objective
Implement the core SQLite database models in Django, create a lightweight PIN-based authentication endpoint, and build the React authentication context and Login UI.

---

### Task 1: Django Database Models
In `backend/api/models.py`, generate the following models. Use standard Django ORM fields.
1.  **FamilyMember:** `name` (Char), `pin_code` (Char, 4 digits), `is_admin` (Boolean).
2.  **Account:** `owner` (ForeignKey to FamilyMember), `bank_name` (Char), `account_type` (Char: Credit/Debit), `last_four_digits` (Char, nullable), `pdf_password` (Char, nullable).
3.  **Transaction:** `account` (ForeignKey to Account), `amount` (Decimal), `transaction_type` (Char: CREDIT/DEBIT), `merchant_name` (Char), `category` (Char, default "Uncategorized"), `timestamp` (DateTime), `source` (Char: SMS_ANDROID, SMS_IOS, EMAIL, MANUAL), `deduplication_hash` (Char, unique).
4.  **SystemSettings:** A singleton model containing `active_ai_provider` (Char), `api_key` (Char), `monthly_budget_target` (Decimal).

*Action:* After creating the models, provide the terminal commands to create and run the migrations, and a quick script or Django shell command to create a default Admin user with a PIN.

---

### Task 2: Backend Authentication API
In `backend/api/views.py` (using Django REST Framework or standard JsonResponse) and `backend/api/urls.py`:
1.  Create an endpoint `POST /api/auth/login/`.
2.  It should accept a JSON payload: `{"pin": "1234"}`.
3.  Check if a `FamilyMember` matches the PIN.
4.  If matched, return a 200 OK with `{"id": 1, "name": "User", "role": "admin"}`.
5.  If not matched, return a 401 Unauthorized.

---

### Task 3: React Auth Context
In `frontend/src/context/FamilyAuthContext.jsx`:
1.  Create a React Context that manages `currentUser`, `isAuthenticated`, and `isLoading`.
2.  On mount, check `localStorage` for `localcent_user` to persist sessions.
3.  Implement a `login(pin)` function that sends a POST request to `/api/auth/login/` and saves the user to state and `localStorage` on success.
4.  Implement a `logout()` function that clears state and `localStorage`.

---

### Task 4: React Login Interface
In `frontend/src/pages/Login.jsx`:
1.  Build a clean, mobile-friendly PIN entry screen using Tailwind CSS.
2.  Include a numeric keypad UI (buttons 0-9) so users can tap their PIN easily on a phone.
3.  Visually show 4 dot indicators that fill up as the user types their PIN.
4.  Once 4 digits are entered, automatically call the `login(pin)` function from `FamilyAuthContext`.
5.  If successful, redirect to `/` (Dashboard). If it fails, shake the dots or show a red error text and clear the input.

---

### Output Requirements
Please provide the complete code for `models.py`, `views.py`, `urls.py`, `FamilyAuthContext.jsx`, and `Login.jsx`.
