import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import FamilyMember

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pin = data.get('pin')
            member = FamilyMember.objects.get(pin_code=pin)
            return JsonResponse({
                "id": member.id,
                "name": member.name,
                "role": "admin" if member.is_admin else "user"
            }, status=200)
        except FamilyMember.DoesNotExist:
            return JsonResponse({"error": "Unauthorized"}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

from django.db import IntegrityError
from datetime import datetime
from .models import Account, Transaction
from .services import parse_sms_text, generate_transaction_hash, assign_category

@csrf_exempt
def webhook_sms(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message', '')
            timestamp_str = data.get('timestamp')
            source = data.get('source', 'SMS_UNKNOWN')
            
            # Parse SMS
            parsed = parse_sms_text(message)
            
            # Parse Timestamp
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00")) if timestamp_str else datetime.now()
            except Exception:
                timestamp = datetime.now()

            # Find or Create Account
            default_member = FamilyMember.objects.first()
            if not default_member:
                return JsonResponse({"error": "System not initialized (no users)"}, status=500)
                
            account, created = Account.objects.get_or_create(
                last_four_digits=parsed['account_last_4'],
                defaults={
                    'owner': default_member,
                    'bank_name': 'Unknown Bank',
                    'account_type': 'Unknown'
                }
            )

            # Generate deduplication hash
            dedup_hash = generate_transaction_hash(parsed['amount'], timestamp, parsed['account_last_4'])
            
            # Auto-Categorization
            category = assign_category(parsed['merchant_name'])

            # Save Transaction
            try:
                Transaction.objects.create(
                    account=account,
                    amount=parsed['amount'],
                    transaction_type=parsed['transaction_type'],
                    merchant_name=parsed['merchant_name'],
                    category=category,
                    timestamp=timestamp,
                    source=source,
                    deduplication_hash=dedup_hash
                )
                return JsonResponse({"status": "success"}, status=201)
            except IntegrityError:
                return JsonResponse({"status": "duplicate ignored"}, status=200)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def update_transaction(request, tx_id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            tx = Transaction.objects.get(id=tx_id)
            
            if 'category' in data:
                tx.category = data['category']
                tx.save()
                
                # Create a new CategoryRule if requested
                if data.get('create_rule'):
                    # Use a clean, simple substring of the merchant name (e.g. first word)
                    clean_merchant = tx.merchant_name.split()[0].lower()
                    CategoryRule.objects.get_or_create(
                        merchant_substring=clean_merchant,
                        defaults={'category': tx.category}
                    )
                    
            return JsonResponse({"status": "success"}, status=200)
        except Transaction.DoesNotExist:
            return JsonResponse({"error": "Transaction not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def list_transactions(request):
    if request.method == 'GET':
        txs = Transaction.objects.all().select_related('account').order_by('-timestamp')[:50]
        data = [{
            "id": t.id,
            "account_last_4": t.account.last_four_digits,
            "bank_name": t.account.bank_name,
            "amount": float(t.amount),
            "transaction_type": t.transaction_type,
            "merchant_name": t.merchant_name,
            "category": t.category,
            "timestamp": t.timestamp.isoformat(),
            "source": t.source
        } for t in txs]
        return JsonResponse(data, safe=False, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

from django.db.models import Sum
from .models import SystemSettings
from .services import get_credit_card_summaries

def dashboard_summary(request):
    if request.method == 'GET':
        # Default to current month/year
        now = datetime.now()
        month = int(request.GET.get('month', now.month))
        year = int(request.GET.get('year', now.year))

        # Filter transactions for the requested month
        txs_month = Transaction.objects.filter(timestamp__year=year, timestamp__month=month)

        total_income = txs_month.filter(transaction_type='CREDIT').aggregate(Sum('amount'))['amount__sum'] or 0.0
        total_spent = txs_month.filter(transaction_type='DEBIT').aggregate(Sum('amount'))['amount__sum'] or 0.0

        settings = SystemSettings.objects.first()
        monthly_budget_target = float(settings.monthly_budget_target) if settings else 10000.00
        
        remaining_budget = monthly_budget_target - float(total_spent)
        
        credit_cards = get_credit_card_summaries()

        return JsonResponse({
            "total_income": float(total_income),
            "total_spent": float(total_spent),
            "remaining_budget": remaining_budget,
            "monthly_budget_target": monthly_budget_target,
            "credit_cards": credit_cards,
            "month": month,
            "year": year
        }, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def system_settings(request):
    settings, created = SystemSettings.objects.get_or_create(id=1)
    
    if request.method == 'GET':
        masked_key = ""
        if settings.api_key:
            masked_key = "••••••••••••"
            
        return JsonResponse({
            "active_ai_provider": settings.active_ai_provider,
            "api_key_masked": masked_key,
            "has_api_key": bool(settings.api_key),
            "monthly_budget_target": float(settings.monthly_budget_target)
        }, status=200)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            if 'active_ai_provider' in data:
                settings.active_ai_provider = data['active_ai_provider']
            if 'api_key' in data and data['api_key'] and data['api_key'] != '••••••••••••':
                settings.api_key = data['api_key']
            if 'monthly_budget_target' in data:
                settings.monthly_budget_target = data['monthly_budget_target']
            settings.save()
            return JsonResponse({"status": "success"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

from .ai_service import get_aggregated_data, generate_financial_advice

@csrf_exempt
def ai_analyze(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            timeframe = data.get('timeframe', 'current_month')
            
            settings = SystemSettings.objects.first()
            if not settings or not settings.api_key:
                return JsonResponse({"success": False, "error": "AI API Key not configured in Settings."}, status=400)
                
            agg_data = get_aggregated_data(timeframe)
            result = generate_financial_advice(agg_data, settings.active_ai_provider, settings.get_decrypted_api_key())
            
            if result.get("success"):
                return JsonResponse({"success": True, "analysis": result["analysis"]}, status=200)
            else:
                return JsonResponse({"success": False, "error": result.get("error")}, status=500)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

from .models import RecurringBill
from .services import scan_for_recurring_bills

@csrf_exempt
def list_or_create_bills(request):
    if request.method == 'GET':
        bills = RecurringBill.objects.all().order_by('next_due_date')
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        # Check if paid this month
        data = []
        for bill in bills:
            # Look for a debit transaction this month matching merchant and amount (roughly)
            is_paid = Transaction.objects.filter(
                transaction_type='DEBIT',
                merchant_name__icontains=bill.merchant_name,
                timestamp__year=current_year,
                timestamp__month=current_month,
                amount__gte=float(bill.expected_amount) * 0.8,
                amount__lte=float(bill.expected_amount) * 1.2
            ).exists()
            
            data.append({
                "id": bill.id,
                "merchant_name": bill.merchant_name,
                "expected_amount": float(bill.expected_amount),
                "next_due_date": bill.next_due_date.isoformat(),
                "frequency": bill.frequency,
                "is_auto_detected": bill.is_auto_detected,
                "is_paid_this_month": is_paid
            })
            
        return JsonResponse(data, safe=False, status=200)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            bill = RecurringBill.objects.create(
                merchant_name=data['merchant_name'],
                expected_amount=data['expected_amount'],
                next_due_date=data['next_due_date'],
                frequency=data.get('frequency', 'MONTHLY'),
                is_auto_detected=False
            )
            return JsonResponse({"status": "success", "id": bill.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def scan_bills(request):
    if request.method == 'POST':
        try:
            detected_count = scan_for_recurring_bills()
            return JsonResponse({"status": "success", "detected_count": detected_count}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def manage_accounts(request):
    if request.method == 'GET':
        accounts = Account.objects.all()
        data = []
        for acc in accounts:
            data.append({
                "id": acc.id,
                "bank_name": acc.bank_name,
                "account_type": acc.account_type,
                "last_four_digits": acc.last_four_digits,
                "statement_day": acc.statement_day,
                "due_day": acc.due_day,
                "has_pdf_password": bool(acc.pdf_password)
            })
        return JsonResponse(data, safe=False, status=200)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            default_member = FamilyMember.objects.first()
            if not default_member:
                return JsonResponse({"error": "System not initialized"}, status=500)
                
            acc = Account.objects.create(
                owner=default_member,
                bank_name=data.get('bank_name', 'Unknown'),
                account_type=data.get('account_type', 'Credit'),
                last_four_digits=data.get('last_four_digits'),
                statement_day=data.get('statement_day'),
                due_day=data.get('due_day'),
                pdf_password=data.get('pdf_password')
            )
            return JsonResponse({"status": "success", "id": acc.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

import csv
from django.http import HttpResponse

@csrf_exempt
def export_transactions_csv(request):
    if request.method == 'GET':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="localcent_transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Date', 'Amount', 'Type', 'Merchant', 'Category', 'Account_Last4', 'Bank_Name', 'Source'])

        txs = Transaction.objects.all().select_related('account').order_by('-timestamp')
        for t in txs:
            writer.writerow([
                t.id,
                t.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                t.amount,
                t.transaction_type,
                t.merchant_name,
                t.category,
                t.account.last_four_digits,
                t.account.bank_name,
                t.source
            ])

        return response
    return JsonResponse({"error": "Method not allowed"}, status=405)

