import os
import imaplib
import email
from email.header import decode_header
from datetime import datetime
from django.db import IntegrityError
from .models import Account, Transaction, SystemSettings
from .services import generate_transaction_hash, assign_category
from .pdf_parser import process_statement_pdf

def get_imap_server(email_address):
    domain = email_address.split('@')[-1].lower()
    if domain in ['gmail.com', 'googlemail.com']:
        return 'imap.gmail.com'
    elif domain in ['yahoo.com', 'ymail.com', 'rocketmail.com']:
        return 'imap.mail.yahoo.com'
    elif domain in ['outlook.com', 'hotmail.com', 'live.com', 'msn.com']:
        return 'imap-mail.outlook.com'
    elif domain in ['icloud.com', 'me.com', 'mac.com']:
        return 'imap.mail.me.com'
    else:
        # Fallback heuristic
        return f'imap.{domain}'

def fetch_and_process_emails():
    """
    Connects to IMAP, finds unread bank statements, downloads PDFs into memory,
    decrypts them, and saves the transactions.
    """
    settings = SystemSettings.objects.first()
    if not settings or not settings.imap_email or not settings.imap_password:
        print("IMAP credentials not configured. Skipping email fetch.")
        return 0
        
    imap_email = settings.imap_email
    imap_password = settings.get_decrypted_imap_password()
    imap_server = get_imap_server(imap_email)

    try:
        mail = imaplib.IMAP4_SSL(imap_server)
        mail.login(imap_email, imap_password)
        mail.select("inbox")
        
        # Search for unread emails with attachments (basic filter, can be refined by sender)
        status, messages = mail.search(None, '(UNSEEN)')
        
        if status != "OK":
            return 0
            
        email_ids = messages[0].split()
        processed_count = 0
        
        for e_id in email_ids:
            res, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    # We only care about emails with attachments
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_disposition = str(part.get("Content-Disposition"))
                            if "attachment" in content_disposition and part.get_filename().lower().endswith('.pdf'):
                                pdf_bytes = part.get_payload(decode=True)
                                
                                # Try to decrypt with all configured account passwords
                                accounts = Account.objects.exclude(pdf_password__isnull=True).exclude(pdf_password__exact='')
                                
                                for account in accounts:
                                    transactions = process_statement_pdf(pdf_bytes, account.get_decrypted_password())
                                    
                                    if transactions is not None:
                                        # Successfully decrypted and parsed
                                        for t in transactions:
                                            try:
                                                # Use arbitrary time for date-only parses
                                                dt = datetime.strptime(t['date'], "%d/%m/%Y")
                                                dt = dt.replace(hour=12, minute=0, second=0)
                                            except ValueError:
                                                try:
                                                    dt = datetime.strptime(t['date'], "%d-%m-%Y")
                                                    dt = dt.replace(hour=12, minute=0, second=0)
                                                except ValueError:
                                                    dt = datetime.now()
                                            
                                            # Generate Deduplication Hash (same logic as Phase 3)
                                            last_4 = account.last_four_digits or "0000"
                                            dedup_hash = generate_transaction_hash(t['amount'], dt, last_4)
                                            
                                            # Auto-categorize
                                            category = assign_category(t['merchant'])
                                            
                                            try:
                                                Transaction.objects.create(
                                                    account=account,
                                                    amount=t['amount'],
                                                    transaction_type=t['type'],
                                                    merchant_name=t['merchant'],
                                                    category=category,
                                                    timestamp=dt,
                                                    source="EMAIL_STATEMENT",
                                                    deduplication_hash=dedup_hash
                                                )
                                                processed_count += 1
                                            except IntegrityError:
                                                pass # Duplicate ignored
                                        
                                        break # Stop trying passwords once successful
                                        
            # Mark as read so we don't process it again
            mail.store(e_id, '+FLAGS', r'\SEEN')
            
        mail.close()
        mail.logout()
        return processed_count
        
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return 0
