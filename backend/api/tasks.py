from huey.contrib.djhuey import periodic_task, db_task
from huey import crontab
from .models import Transaction
from .email_worker import fetch_and_process_emails

# This task will run every 30 minutes
@periodic_task(crontab(minute='*/30'))
def poll_imap_emails():
    print("Polling IMAP emails for new bank statements...")
    fetch_and_process_emails()

@db_task()
def process_pdf_statement(file_path, password):
    # Process a single PDF asynchronously
    pass
