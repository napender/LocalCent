# LocalCent - Phase 5: The AI Analysis Engine

### Context
Phases 1 through 4 are complete. We have a working Django REST API, transaction ingestion webhooks, and a React dashboard showing summary metrics. We are now implementing the AI engine to provide 1-click financial analysis using external LLM APIs (OpenAI, Anthropic, or DeepSeek) based on user-provided keys.

### Objective
Build the configuration endpoints for storing API keys securely locally, create a data aggregator to compress transaction history, set up the prompt builder, and implement a streaming (or asynchronous) endpoint to deliver AI insights to a React modal.

---

### Task 1: API Key & Settings Configuration
1.  **Backend (`backend/api/views.py`):** Create `GET` and `POST` endpoints at `/api/settings/` to retrieve and update the `SystemSettings` singleton model (fields: `active_ai_provider`, `openai_api_key`, `anthropic_api_key`, `gemini_api_key`, `deepseek_api_key`, `groq_api_key`, `ai_model_mode`, `ai_model_tier`, `ai_custom_model`, `monthly_budget_target`). 
2.  **Security Note:** When returning the GET request, mask the API keys (e.g., `••••••••••••`) so they are not fully exposed to the frontend after saving.
3.  **Frontend (`frontend/src/features/settings/SettingsForm.jsx` & `AiSettings.jsx`):** Build a form to select the AI Provider. Implement a "Simple / Advanced" toggle to allow users to either pick a "Fast & Cheap" / "Powerful & Smart" tier, or input a custom LLM model string directly. Maintain independent state for all provider keys so users can switch providers without losing their keys.

---

### Task 2: Data Aggregation Engine (Backend)
In a new file `backend/api/ai_service.py`:
1.  Create a function `get_aggregated_data(timeframe)`. `timeframe` can be `"current_month"`, `"last_month"`, or `"last_3_months"`.
2.  **Aggregation Logic:** Do NOT send raw, line-by-line transaction logs to the LLM (to save tokens and prevent confusion). Instead, use Django's `annotate` and `aggregate` to return a compressed JSON dictionary:
    *   Total Income & Total Spent.
    *   Spend grouped by `category` (e.g., `{"Food": 5000, "Transport": 2000}`).
    *   Top 5 `merchant_name`s by amount spent.
    *   Total recurring bills expected this month.

---

### Task 3: The Prompt Builder & LLM Call (Backend)
Still in `backend/api/ai_service.py`:
1.  Create a function `generate_financial_advice(aggregated_data, provider, api_key, settings)`.
2.  **The System Prompt:** Write a strict system prompt instructing the AI to act as a concise, expert financial advisor. It should analyze the JSON data, point out anomalies or high spend areas, and provide actionable tips in Markdown format. Tell it to avoid generic advice and focus strictly on the provided numbers.
3.  **The Integration:** Use `litellm.completion` to send the prompt to the selected provider. The model string should be dynamically determined:
    - If `ai_model_mode` is 'advanced', use `ai_custom_model`.
    - If 'simple', map the `provider` and `ai_model_tier` to the appropriate model (e.g. `openai` + `fast` = `gpt-4o-mini`, `groq` + `smart` = `groq/llama-3.1-70b-versatile`).

---

### Task 4: The AI API Endpoint
In `backend/api/views.py`:
1.  Create `POST /api/ai/analyze/`.
2.  The frontend will send `{"timeframe": "current_month"}`.
3.  Fetch the API key from `SystemSettings`, call `get_aggregated_data()`, and pass it to `generate_financial_advice()`.
4.  *(Bonus/Optional for the AI agent)*: If possible, use Django's `StreamingHttpResponse` to stream the LLM chunks back to the frontend. If too complex for now, a standard JSON response containing the full markdown text is acceptable.

---

### Task 5: AI Chat Modal (Frontend)
In `frontend/src/features/ai-analysis/AIAnalysisModal.jsx`:
1.  Build a Tailwind CSS modal overlay.
2.  When opened via the "Analyze current month" button, show a glowing loading state or spinner while waiting for the backend.
3.  Once the text arrives, render it using a library like `react-markdown` so the bolding, lists, and headers from the LLM display beautifully.
4.  Include a "Close" button.

---

### Output Requirements
Please provide the backend aggregation code, the prompt construction logic, the Django view for the AI endpoint, and the React code for the `AIAnalysisModal.jsx`. Specify if you need me to install any new libraries (like `requests`, `openai`, or `react-markdown`).
