# LocalCent - Phase 9.1: Security & Data at Rest Encryption

### Context
Phases 1 through 8 are complete. The core application is fully functional. Before deploying for daily use, we must secure sensitive data stored in the SQLite database (`pdf_password` for credit cards and `api_key` for the LLM). Currently, these are stored as plaintext.

### Objective
Implement symmetric encryption using the Python `cryptography` library. Create a mechanism to encrypt sensitive fields before saving them to the database and decrypt them in memory when needed by the backend.

---

### Task 1: Environment & Key Setup
1.  **Dependency:** Install the `cryptography` library (`pip install cryptography`).
2.  **Key Generation:** Create a small Python script to generate a secure Fernet key.
3.  **Environment Variable:** Store this key in a `.env` file at the root of the Django project (e.g., `ENCRYPTION_KEY=your_fernet_key`). Ensure `.env` is added to `.gitignore`.

---

### Task 2: Encryption Utility (Backend)
In a new file `backend/api/encryption.py`:
1.  Import `Fernet` from `cryptography.fernet`.
2.  Load the `ENCRYPTION_KEY` from the environment.
3.  Write two helper functions:
    *   `encrypt_string(plaintext: str) -> str`: Returns the encrypted string.
    *   `decrypt_string(ciphertext: str) -> str`: Returns the decrypted plaintext. Handle cases where the input might not be encrypted (for backwards compatibility during the migration).

---

### Task 3: Secure the Models (Backend)
In `backend/api/models.py`:
1.  Override the `save()` method for the `Account` model. Before calling `super().save()`, check if `pdf_password` has changed or is unencrypted, and run it through `encrypt_string()`.
2.  Override the `save()` method for the `SystemSettings` model. Do the same for the `api_key`.
3.  Add property methods (e.g., `get_decrypted_password()`, `get_decrypted_api_key()`) to these models so the IMAP worker and AI service can easily retrieve the plaintext in memory when needed.

---

### Task 4: UI Masking (Frontend)
In `frontend/src/features/settings/`:
1.  Update the `SettingsForm.jsx` and `CardManagement.jsx` components.
2.  When fetching existing records, the backend should return a masked version of the passwords/keys (e.g., `••••••••••••`).
3.  If the user submits the form with the masked string unchanged, the backend should ignore the update for that specific field to prevent overwriting the real password with the masked string.

---

### Output Requirements
Please provide the `encryption.py` utility, the updated `models.py` with the overridden `save()` methods, and the logic for the masked UI handling in the React components.
