# LocalCent - Phase 9.2: macOS Deployment & Automated Backups

### Context
Phase 9.1 (Data Encryption) is complete. The application is secure. Because this system will be hosted on an M1 MacBook Pro and act as an "always-on" home server, we need to move away from manually running terminal commands. We must daemonize the application to start on boot and implement an automated backup strategy for the SQLite database.

### Objective
Configure a process manager to run Django, the React Vite server, and the Huey background task queue simultaneously. Create a daily automated backup script for the `db.sqlite3` file with a 7-day rolling retention policy.

---

### Task 1: Process Management with PM2
Instead of writing complex macOS `launchd` `.plist` files, we will use `pm2`, a robust process manager that handles Python and Node applications perfectly and can hook into the macOS startup sequence.
1.  **Dependency:** Install PM2 globally via npm (`npm install -g pm2`).
2.  **Configuration:** Create an `ecosystem.config.js` file in the root of the `finance-dashboard` monorepo.
3.  **Processes to Define:**
    *   **Django API:** Run `python manage.py runserver 0.0.0.0:8000` from the `backend` directory using the virtual environment python executable.
    *   **Huey Worker:** Run `python manage.py run_huey` from the `backend` directory using the virtual environment.
    *   **React UI:** Run `npm run dev -- --host 0.0.0.0` from the `frontend` directory.

---

### Task 2: macOS Boot Hook
1.  Provide the terminal commands to freeze the PM2 process list (`pm2 save`) and generate the macOS startup script (`pm2 startup`) so that LocalCent spins up seamlessly in the background whenever the Mac reboots.

---

### Task 3: Rolling SQLite Backup Script
Because the entire database is a single file, backing it up is trivial, but it must be automated.
1.  Create a bash script `scripts/backup_db.sh` in the root folder.
2.  **Logic:** 
    *   Create a `backups` directory if it doesn't exist.
    *   Copy `backend/db.sqlite3` to `backups/db_backup_YYYY-MM-DD.sqlite3`.
    *   Find and delete any backups in that folder older than 7 days to prevent disk bloat.
3.  Provide the exact command to add this bash script to the macOS `crontab` so it executes automatically every night at 2:00 AM.

---

### Output Requirements
Please provide the complete `ecosystem.config.js` file tailored for a Python virtual environment and React Vite setup. Provide the bash script for the rolling database backup, and list the exact terminal commands required to configure PM2 startup and the crontab on macOS.
