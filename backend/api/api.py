import json
from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404
from .models import FamilyMember, Transaction
from datetime import datetime
from litellm import completion
from django.conf import settings
import os

api = NinjaAPI()

class LoginSchema(Schema):
    pin: str

class LoginResponse(Schema):
    success: bool
    name: str = None
    is_admin: bool = False
    message: str = None

@api.post("/auth/login", response=LoginResponse)
def login(request, payload: LoginSchema):
    try:
        member = FamilyMember.objects.get(pin=payload.pin)
        return {"success": True, "name": member.name, "is_admin": member.is_admin}
    except FamilyMember.DoesNotExist:
        return {"success": False, "message": "Invalid PIN"}

class SMSSchema(Schema):
    sender: str = None
    body: str
    timestamp: str = None

class SMSResponse(Schema):
    success: bool
    message: str

def parse_and_create_transaction(body: str, timestamp: str = None):
    # Basic mock parser, this needs real regex depending on banks
    # For now, let's extract mock data from body if possible or use defaults
    try:
        # Example naive parsing: "Spent 50.00 at Amazon from Account 1234"
        # In a real app, you'd use LLM or regex here
        amount = 0.0
        account = "Unknown"
        date = datetime.now() if not timestamp else datetime.fromisoformat(timestamp)
        
        # very naive extraction for demonstration
        words = body.split()
        for word in words:
            if word.replace('.', '', 1).isdigit():
                amount = float(word)
                break
                
        if "from" in body.lower():
            idx = body.lower().find("from")
            account = body[idx+5:idx+15].strip()
            
        t = Transaction(
            date=date,
            amount=amount,
            account=account,
            raw_text=body
        )
        t.save()
        return True
    except Exception as e:
        print(f"Failed to parse transaction: {e}")
        return False

@api.post("/sms/android", response=SMSResponse)
def android_sms(request, payload: SMSSchema):
    success = parse_and_create_transaction(payload.body, payload.timestamp)
    return {"success": success, "message": "Processed Android SMS"}

@api.post("/sms/ios", response=SMSResponse)
def ios_sms(request, payload: SMSSchema):
    success = parse_and_create_transaction(payload.body, payload.timestamp)
    return {"success": success, "message": "Processed iOS SMS"}

class AIRequest(Schema):
    prompt: str
    model: str = "gpt-3.5-turbo" # Default, can be overridden by frontend
    api_key: str = None # Passed from frontend config

@api.post("/ai/analyze")
def ai_analyze(request, payload: AIRequest):
    # Fetch all transactions and compress to JSON
    txs = Transaction.objects.all().order_by('-date')[:50]
    tx_data = [
        {"date": t.date.isoformat(), "amount": float(t.amount), "account": t.account}
        for t in txs
    ]
    
    system_prompt = f"You are a financial advisor. Here is the transaction history:\n{json.dumps(tx_data)}\n\nAnalyze it based on user request."
    
    # Configure API key for litellm
    if payload.api_key:
        os.environ["OPENAI_API_KEY"] = payload.api_key
        # litellm handles specific provider keys based on model prefix, 
        # but for simplicity we assume OpenAI API key or we can let litellm handle it 
        # by passing api_key parameter
    
    try:
        response = completion(
            model=payload.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.prompt}
            ],
            api_key=payload.api_key
        )
        return {"success": True, "analysis": response.choices[0].message.content}
    except Exception as e:
        return {"success": False, "error": str(e)}

@api.get("/transactions")
def get_transactions(request):
    txs = Transaction.objects.all().order_by('-date')
    return [{
        "id": t.id,
        "date": t.date.isoformat(),
        "amount": float(t.amount),
        "account": t.account,
        "raw_text": t.raw_text
    } for t in txs]
