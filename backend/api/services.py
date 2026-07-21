import hashlib
import re
from datetime import datetime

def generate_transaction_hash(amount, date_time, account_last_4):
    """
    Rounds the date_time to the nearest hour, concatenates amount and account,
    and returns a SHA-256 hash.
    """
    if isinstance(date_time, str):
        try:
            date_time = datetime.fromisoformat(date_time)
        except ValueError:
            date_time = datetime.now()
            
    rounded_date = date_time.replace(minute=0, second=0, microsecond=0)
    hash_string = f"{rounded_date.isoformat()}_{float(amount)}_{account_last_4}"
    return hashlib.sha256(hash_string.encode('utf-8')).hexdigest()

from .models import CategoryRule

def assign_category(merchant_name):
    """
    Checks the CategoryRule database for matching merchant substrings.
    """
    merchant_lower = merchant_name.lower()
    rules = CategoryRule.objects.all()
    for rule in rules:
        if rule.merchant_substring.lower() in merchant_lower:
            return rule.category
    return "Uncategorized"

from datetime import timedelta
from django.db.models import Count
from .models import Transaction, RecurringBill

def scan_for_recurring_bills():
    """
    Scans recent DEBIT transactions to auto-detect recurring monthly bills.
    """
    # Get all DEBIT transactions in the last 90 days
    ninety_days_ago = datetime.now() - timedelta(days=90)
    recent_txs = Transaction.objects.filter(
        transaction_type='DEBIT',
        timestamp__gte=ninety_days_ago
    ).order_by('merchant_name', 'timestamp')

    # Group by merchant
    merchants = {}
    for tx in recent_txs:
        clean_merchant = tx.merchant_name.strip()
        if clean_merchant not in merchants:
            merchants[clean_merchant] = []
        merchants[clean_merchant].append(tx)

    detected = 0
    for merchant, txs in merchants.items():
        if len(txs) < 2:
            continue
            
        # Check consecutive pairs for 28-31 day gaps and similar amounts (+/- 10%)
        for i in range(len(txs) - 1):
            t1 = txs[i]
            t2 = txs[i+1]
            
            days_diff = (t2.timestamp - t1.timestamp).days
            amount_diff = abs(float(t1.amount) - float(t2.amount))
            avg_amount = (float(t1.amount) + float(t2.amount)) / 2
            
            # If 28-31 days apart and amount is within 10%
            if 27 <= days_diff <= 32 and (amount_diff / avg_amount) < 0.1:
                # Candidate found! Check if it already exists
                exists = RecurringBill.objects.filter(merchant_name__iexact=merchant).exists()
                if not exists:
                    # Estimate next due date
                    next_due = t2.timestamp + timedelta(days=30)
                    
                    RecurringBill.objects.create(
                        merchant_name=merchant,
                        expected_amount=avg_amount,
                        next_due_date=next_due.date(),
                        frequency="MONTHLY",
                        is_auto_detected=True
                    )
                    detected += 1
                break # Move to next merchant
                
    return detected

from django.db.models import Sum
from .models import Account

def get_credit_card_summaries():
    """
    Calculates the unbilled amount and days until due for all credit cards.
    Returns a list of dicts.
    """
    summaries = []
    accounts = Account.objects.exclude(statement_day__isnull=True).exclude(due_day__isnull=True)
    
    now = datetime.now()
    
    for acc in accounts:
        # Calculate current cycle dates
        # E.g. if statement_day is 15th, and today is 20th July, cycle is 16th June -> 15th July? 
        # Actually if today is 20th July, cycle is 16th July to 15th August.
        
        statement_day = acc.statement_day
        due_day = acc.due_day
        
        if now.day > statement_day:
            # We are in the new cycle (e.g. today=20, statement=15)
            # Cycle start: 16th of current month. Cycle end: 15th of next month
            cycle_start = datetime(now.year, now.month, statement_day) + timedelta(days=1)
            # Handle month rollover for due date
            if due_day < statement_day:
                next_due_month = now.month + 1 if now.month < 12 else 1
                next_due_year = now.year if now.month < 12 else now.year + 1
            else:
                next_due_month = now.month
                next_due_year = now.year
            due_date = datetime(next_due_year, next_due_month, due_day)
        else:
            # We are in the previous cycle (e.g. today=10, statement=15)
            # Cycle start: 16th of previous month. Cycle end: 15th of current month
            prev_month = now.month - 1 if now.month > 1 else 12
            prev_year = now.year if now.month > 1 else now.year - 1
            
            # Simple assumption: prev month has statement_day days (not robust for Feb 28-31)
            # A more robust way:
            cycle_start = datetime(prev_year, prev_month, statement_day) + timedelta(days=1)
            due_date = datetime(now.year, now.month, due_day)
            if due_day < statement_day and due_day < now.day:
                 # Already passed due date this month? Wait, typically due day is ~20 days after statement.
                 # E.g. statement=15, due=5 next month.
                 pass
                 
        # Ensure due_date is in the future
        while due_date.date() < now.date():
             next_month = due_date.month + 1 if due_date.month < 12 else 1
             next_year = due_date.year if due_date.month < 12 else due_date.year + 1
             try:
                 due_date = datetime(next_year, next_month, due_day)
             except ValueError:
                 due_date = datetime(next_year, next_month, 28) # rough fallback
        
        days_until_due = (due_date.date() - now.date()).days
        
        # Calculate unbilled amount (Sum of DEBITs in cycle)
        # Note: True credit card statements include credits as negative, but we'll just sum DEBITs for simplicity
        unbilled = Transaction.objects.filter(
            account=acc,
            transaction_type='DEBIT',
            timestamp__gte=cycle_start
        ).aggregate(total=Sum('amount'))['total'] or 0.0
        
        summaries.append({
            "id": acc.id,
            "bank_name": acc.bank_name,
            "last_four": acc.last_four_digits,
            "unbilled_amount": float(unbilled),
            "due_date": due_date.date().isoformat(),
            "days_until_due": days_until_due
        })
        
    return summaries

def parse_sms_text(message_body):
    """
    Basic SMS parser using regex.
    Extracts amount, transaction_type (CREDIT/DEBIT), merchant_name, and account_last_4.
    """
    message_lower = message_body.lower()
    
    # 1. Extract Amount
    # Looks for INR, Rs., Rs, followed by optional spaces and numbers
    amount_match = re.search(r'(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)', message_lower, re.IGNORECASE)
    amount = 0.0
    if amount_match:
        try:
            amount_str = amount_match.group(1).replace(',', '')
            amount = float(amount_str)
        except ValueError:
            pass

    # 2. Extract Type
    transaction_type = "DEBIT"
    credit_keywords = ['credited', 'deposit', 'added']
    if any(keyword in message_lower for keyword in credit_keywords):
        transaction_type = "CREDIT"
        
    # 3. Extract Merchant
    merchant_name = "Unknown Merchant"
    # Basic logic: text after "at", "to", "info" up to next space or end of sentence
    merchant_match = re.search(r'\b(?:at|to|info)\s+([a-z0-9\s]+)', message_lower, re.IGNORECASE)
    if merchant_match:
        merchant_name = merchant_match.group(1).strip().title()
        
    # 4. Extract Account Last 4
    account_last_4 = "0000"
    ac_match = re.search(r'(?:a/c|acct|account)[\s\w]*(\d{4})\b', message_lower, re.IGNORECASE)
    if ac_match:
        account_last_4 = ac_match.group(1)
        
    return {
        "amount": amount,
        "transaction_type": transaction_type,
        "merchant_name": merchant_name,
        "account_last_4": account_last_4
    }
