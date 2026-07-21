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

def generate_financial_advice(aggregated_data, provider, api_key, settings=None):
    """
    Uses litellm to get financial advice based on compressed JSON.
    """
    system_prompt = """You are a concise, expert financial advisor. 
Analyze the provided JSON data containing a user's recent income and spending.
Point out anomalies, high spend areas, and provide actionable tips in Markdown format.
Avoid generic advice; focus strictly on the provided numbers. Keep it brief and impactful."""

    user_content = f"Here is my financial data:\n{json.dumps(aggregated_data, indent=2)}"

    # Determine the model string based on settings
    model = "gpt-3.5-turbo"
    provider = provider.lower()
    
    if settings and settings.ai_model_mode == 'advanced' and settings.ai_custom_model:
        model = settings.ai_custom_model
    else:
        tier = getattr(settings, 'ai_model_tier', 'fast') if settings else 'fast'
        if tier == 'smart':
            if provider == 'openai': model = 'gpt-4o'
            elif provider == 'anthropic': model = 'claude-3-5-sonnet-20240620'
            elif provider == 'gemini': model = 'gemini-1.5-pro'
            elif provider == 'deepseek': model = 'deepseek/deepseek-reasoner'
            elif provider == 'groq': model = 'groq/llama-3.1-70b-versatile'
            else: model = 'gpt-4o'
        else:
            if provider == 'openai': model = 'gpt-4o-mini'
            elif provider == 'anthropic': model = 'claude-3-haiku-20240307'
            elif provider == 'gemini': model = 'gemini-1.5-flash'
            elif provider == 'deepseek': model = 'deepseek/deepseek-chat'
            elif provider == 'groq': model = 'groq/llama-3.1-8b-instant'
            else: model = 'gpt-3.5-turbo'
    
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
