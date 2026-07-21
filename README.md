<div align="center">
  <img src="assets/logo-wide.png" alt="LocalCent Logo" width="400"/>
  <h1>LocalCent</h1>
  <p><strong>A Hyper-Local, Privacy-First Personal Finance Tracker</strong></p>
</div>

---

## 🛡️ Privacy First

LocalCent is designed for users who want to take control of their finances without handing their personal data over to third-party servers. All of your financial data, transactions, and AI analysis are stored and processed **locally** on your machine. Your wealth, your business.

## ✨ Features

- 💸 **Transaction Tracking**: Log daily expenses and incomes with ease. Support for smart deduplication based on transaction hash.
- 🔁 **Recurring Bills Detection**: Automatic detection of fixed, recurring expenses so you're never caught off guard.
- 💳 **Credit Card Statements**: Track unbilled amounts and upcoming due dates across multiple credit cards.
- 🤖 **AI Financial Advisor**: Integrated with OpenAI, Anthropic, and DeepSeek. Ask your local advisor to analyze your spending trends and give personalized budgeting tips.
- 🔒 **End-to-End Encryption**: SMS and email payloads processed by the backend are encrypted at rest using AES-256.
- 🌙 **Light & Dark Themes**: A beautifully crafted UI using standard Tailwind `dark:` variants. Fully responsive and visually stunning.
- 📱 **Progressive Web App (PWA)**: Install LocalCent on your desktop or mobile device. Works completely offline with seamless network status detection.

## 🚀 Tech Stack

- **Frontend**: React, Vite, TailwindCSS (with robust Light/Dark mode support)
- **Backend**: Django (Python), SQLite
- **Background Tasks**: Huey (Redis)
- **Process Management**: PM2

## 🛠️ Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

*(Note: Requires Redis running locally for Huey tasks)*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Production Deployment

LocalCent is configured to be deployed locally via **PM2**.

```bash
npm run pm2:start
```
*(This starts both the Django backend and the Vite preview server in the background).*

## 🔐 Security & Architecture Notes
- **Database**: LocalCent uses **SQLite** by design to keep everything in a single, local file without the overhead of running a full Postgres/MySQL service. For a personal app, this is ideal. Ensure your file permissions on `db.sqlite3` are restrictive (e.g., `chmod 600`).
- **Network Access**: By default, the Vite dev server binds to `0.0.0.0` (as defined in `ecosystem.config.js`). This is intentional so you can access LocalCent from your phone or tablet on the same local Wi-Fi network. Ensure your local network is trusted.

## ⚙️ Configuration
To utilize the AI capabilities or automated backups, ensure you fill out your API Keys in the in-app **Settings** page. All configuration is stored safely in your local SQLite database and encrypted at rest using your `.env` encryption key.

## 🤝 Contributing
Since this is a hyper-local privacy tool, feel free to fork, customize, and extend LocalCent to fit your specific financial workflow!
