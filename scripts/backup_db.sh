#!/bin/bash
# LocalCent Rolling Database Backup

# Navigate to the project root directory relative to this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Ensure the backups directory exists
mkdir -p backups

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="backups/db_backup_$DATE.sqlite3"

# Copy the database (SQLite can be safely copied while running, though in high concurrency scenarios `.backup` command in sqlite3 cli is better. For a personal finance app, cp is sufficient)
cp backend/db.sqlite3 "$BACKUP_FILE"

# Find and delete backups older than 7 days to prevent disk bloat
find backups -name "db_backup_*.sqlite3" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
echo "Old backups cleaned up."
