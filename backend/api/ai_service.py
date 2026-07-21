import json
from datetime import datetime, timedelta
from django.db.models import Sum
from .models import Transaction
from litellm import completion

def get_aggregated_data(timeframe):
    """
    Returns compressed JSON dictionary of transaction metrics.
    """
    now = datetime.now()
    if timeframe == "last_month":
        # simple calc for previous month
        first = now.replace(day=1)
        end_date = first - timedelta(days=1)
        start_date = end_date.replace(day=1)
    elif timeframe == "last_3_months":
        end_date = now
        start_date = (now - timedelta(days=90)).replace(day=1)
    else: # current_month
        start_date = now.replace(day=1)
        end_date = now

    txs = Transaction.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)
    
    total_income = float(txs.filter(transaction_type='CREDIT').aggregate(Sum('amount'))['amount__sum'] or 0.0)
    total_spent = float(txs.filter(transaction_type='DEBIT').aggregate(Sum('amount'))['amount__sum'] or 0.0)

    # Category grouping
    categories = txs.filter(transaction_type='DEBIT').values('category').annotate(total=Sum('amount')).order_by('-total')
    category_summary = {item['category']: float(item['total']) for item in categories}

    # Top 5 Merchants
    merchants = txs.filter(transaction_type='DEBIT').values('merchant_name').annotate(total=Sum('amount')).order_by('-total')[:5]
    top_merchants = {item['merchant_name']: float(item['total']) for item in merchants}

    return {
        "timeframe": timeframe,
        "start_date": start_date.strftime('%Y-%m-%d'),
        "end_date": end_date.strftime('%Y-%m-%d'),
        "total_income": total_income,
        "total_spent": total_spent,
        "spend_by_category": category_summary,
        "top_5_merchants": top_merchants
    }

def get_chat_context():
    """
    Builds a rich financial context message for the chat AI, including
    current month summary, recent transactions, upcoming bills, and credit card status.
    """
    from .models import RecurringBill, Account
    from .services import get_credit_card_summaries
    from django.db.models import Sum

    now = datetime.now()
    start_of_month = now.replace(day=1)

    txs_month = Transaction.objects.filter(timestamp__gte=start_of_month, timestamp__lte=now)
    total_income = float(txs_month.filter(transaction_type='CREDIT').aggregate(Sum('amount'))['amount__sum'] or 0.0)
    total_spent = float(txs_month.filter(transaction_type='DEBIT').aggregate(Sum('amount'))['amount__sum'] or 0.0)

    categories = txs_month.filter(transaction_type='DEBIT').values('category').annotate(total=Sum('amount')).order_by('-total')
    category_summary = {item['category']: float(item['total']) for item in categories}

    recent_txs = Transaction.objects.select_related('account').order_by('-timestamp')[:10]
    recent_list = [
        {"date": t.timestamp.strftime('%Y-%m-%d'), "amount": float(t.amount),
         "type": t.transaction_type, "merchant": t.merchant_name,
         "category": t.category, "account_last4": t.account.last_four_digits}
        for t in recent_txs
    ]

    bills = RecurringBill.objects.all().order_by('next_due_date')
    upcoming_bills = [
        {"merchant": b.merchant_name, "amount": float(b.expected_amount),
         "due_date": b.next_due_date.isoformat(), "frequency": b.frequency}
        for b in bills
    ]

    credit_cards = get_credit_card_summaries()

    context = {
        "current_month": {
            "total_income": total_income,
            "total_spent": total_spent,
            "spend_by_category": category_summary
        },
        "recent_transactions": recent_list,
        "upcoming_bills": upcoming_bills,
        "credit_cards": credit_cards
    }

    system_prompt = f"""You are a friendly, supportive personal financial advisor named LocalCent AI. You have access to the user's real financial data.

Use the following context to answer their questions accurately. Always reference specific numbers when relevant.
If the user asks about something not in the context, be honest and suggest they add that data.
Keep responses concise, conversational, and helpful. Use markdown for formatting when helpful.

--- FINANCIAL CONTEXT (current as of {now.strftime('%Y-%m-%d')}) ---
{json.dumps(context, indent=2)}
--- END CONTEXT ---"""

    return system_prompt


def get_model_string(provider, settings):
    """
    Returns the litellm model string based on provider and user settings.
    """
    provider = provider.lower()

    if settings and settings.ai_model_mode == 'advanced' and settings.ai_custom_model:
        return settings.ai_custom_model

    tier = getattr(settings, 'ai_model_tier', 'fast') if settings else 'fast'

    if tier == 'smart':
        if provider == 'openai': return 'gpt-4o'
        elif provider == 'anthropic': return 'claude-3-5-sonnet-20240620'
        elif provider == 'gemini': return 'gemini-1.5-pro'
        elif provider == 'deepseek': return 'deepseek/deepseek-reasoner'
        elif provider == 'groq': return 'groq/llama-3.1-70b-versatile'
        else: return 'gpt-4o'
    else:
        if provider == 'openai': return 'gpt-4o-mini'
        elif provider == 'anthropic': return 'claude-3-haiku-20240307'
        elif provider == 'gemini': return 'gemini-1.5-flash'
        elif provider == 'deepseek': return 'deepseek/deepseek-chat'
        elif provider == 'groq': return 'groq/llama-3.1-8b-instant'
        else: return 'gpt-3.5-turbo'


def generate_chat_reply(messages, provider, api_key, settings=None):
    """
    Sends the full conversation history (with financial context injected)
    to the AI provider and returns the reply.
    """
    system_context = get_chat_context()

    full_messages = [{"role": "system", "content": system_context}] + messages

    model = get_model_string(provider, settings)

    try:
        response = completion(
            model=model,
            messages=full_messages,
            api_key=api_key
        )
        return {"success": True, "reply": response.choices[0].message.content}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_financial_advice(aggregated_data, provider, api_key, settings=None):
    """
    Uses litellm to get financial advice based on compressed JSON.
    """
    system_prompt = """You are a concise, expert financial advisor. 
Analyze the provided JSON data containing a user's recent income and spending.
Point out anomalies, high spend areas, and provide actionable tips in Markdown format.
Avoid generic advice; focus strictly on the provided numbers. Keep it brief and impactful."""

    user_content = f"Here is my financial data:\n{json.dumps(aggregated_data, indent=2)}"

    model = get_model_string(provider, settings)

    try:
        response = completion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            api_key=api_key
        )
        return {"success": True, "analysis": response.choices[0].message.content}
    except Exception as e:
        return {"success": False, "error": str(e)}
