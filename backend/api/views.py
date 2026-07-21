import json
from django.http import JsonResponse
import logging
import time
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

from django.contrib.auth import authenticate, login as auth_login, get_user_model
from django.db import IntegrityError
import re
from .models import SecurityAnswer

# Simple in-memory rate limiting for login brute-force protection
LOGIN_ATTEMPTS = {}

def get_client_ip(request):
    return request.META.get('REMOTE_ADDR', '127.0.0.1')

def auth_status(request):
    User = get_user_model()
    return JsonResponse({"is_setup_complete": User.objects.exists()})

@csrf_exempt
def setup_wizard(request):
    if request.method == 'POST':
        User = get_user_model()
        if User.objects.exists():
            return JsonResponse({"error": "Setup is already complete."}, status=400)
            
        try:
            data = json.loads(request.body)
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            email = data.get('email', '')
            password = data.get('password', '')
            q1 = data.get('question_1', '')
            a1 = data.get('answer_1', '')
            q2 = data.get('question_2', '')
            a2 = data.get('answer_2', '')
            
            if not all([email, password, q1, a1, q2, a2]):
                return JsonResponse({"error": "Missing required fields."}, status=400)
                
            # Basic password complexity check
            if len(password) < 8 or not re.search(r'\d', password) or not re.search(r'[^a-zA-Z0-9]', password):
                return JsonResponse({"error": "Password does not meet complexity requirements."}, status=400)
                
            user = User.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name)
            
            # Save security answers
            SecurityAnswer.objects.create(user=user, question_text=q1, hashed_answer=a1)
            SecurityAnswer.objects.create(user=user, question_text=q2, hashed_answer=a2)
            
            # Save IMAP credentials if provided
            imap_email = data.get('imap_email')
            imap_password = data.get('imap_password')
            if imap_email and imap_password:
                settings, _ = SystemSettings.objects.get_or_create(id=1)
                settings.imap_email = imap_email
                settings.imap_password = imap_password
                settings.save()
            
            # Log the user in immediately
            user = authenticate(request, username=email, password=password)
            if user:
                auth_login(request, user)
                return JsonResponse({"status": "success", "user": {"email": user.email, "name": f"{user.first_name} {user.last_name}"}}, status=201)
            return JsonResponse({"status": "success", "message": "User created. Please log in."}, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except IntegrityError:
            return JsonResponse({"error": "Email already exists"}, status=400)
        except Exception as e:
            logger.error(f"Setup error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        client_ip = get_client_ip(request)
        now = time.time()
        
        record = LOGIN_ATTEMPTS.get(client_ip, {"attempts": 0, "lockout_until": 0})
        if now < record["lockout_until"]:
            return JsonResponse({"error": "Too many attempts. Try again later."}, status=429)

        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                LOGIN_ATTEMPTS.pop(client_ip, None)
                auth_login(request, user)
                return JsonResponse({
                    "id": user.id,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}",
                    "role": "admin" if user.is_superuser else "user"
                }, status=200)
            else:
                record["attempts"] += 1
                if record["attempts"] >= 5:
                    record["lockout_until"] = now + 300 # 5 minutes lockout
                LOGIN_ATTEMPTS[client_ip] = record
                
                return JsonResponse({"error": "Invalid email or password"}, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"Login error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def recover_account(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            User = get_user_model()
            user = User.objects.filter(email=email).first()
            if not user:
                # We return a generic message to prevent email enumeration, but since this is a personal app, 
                # returning 404 is also fine. Let's return 404.
                return JsonResponse({"error": "User not found."}, status=404)
                
            questions = list(user.security_answers.values('id', 'question_text'))
            return JsonResponse({"questions": questions}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"Recover error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            answers = data.get('answers') # list of dicts: [{'id': 1, 'answer': 'fluffy'}]
            new_password = data.get('new_password')
            
            if len(new_password) < 8 or not re.search(r'\d', new_password) or not re.search(r'[^a-zA-Z0-9]', new_password):
                return JsonResponse({"error": "Password does not meet complexity requirements."}, status=400)

            User = get_user_model()
            user = User.objects.filter(email=email).first()
            if not user:
                return JsonResponse({"error": "User not found."}, status=404)
                
            # Verify all answers
            valid = True
            for ans_data in answers:
                sa = user.security_answers.filter(id=ans_data['id']).first()
                if not sa or not sa.check_answer(ans_data['answer']):
                    valid = False
                    break
                    
            if not valid:
                return JsonResponse({"error": "Security answers are incorrect."}, status=401)
                
            user.set_password(new_password)
            user.save()
            return JsonResponse({"status": "success", "message": "Password updated successfully."}, status=200)
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"Reset password error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

from .email_service import send_password_reset_email
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str

@csrf_exempt
def forgot_password_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            User = get_user_model()
            user = User.objects.filter(email=email).first()
            if user:
                send_password_reset_email(user, request)
                
            return JsonResponse({"message": "If that email exists, a reset link has been sent"}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"Forgot password email error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def reset_password_confirm(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            uidb64 = data.get('uid')
            token = data.get('token')
            new_password = data.get('new_password')
            
            if not all([uidb64, token, new_password]):
                return JsonResponse({"error": "Missing required fields"}, status=400)
                
            if len(new_password) < 8 or not re.search(r'\d', new_password) or not re.search(r'[^a-zA-Z0-9]', new_password):
                return JsonResponse({"error": "Password does not meet complexity requirements."}, status=400)

            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                User = get_user_model()
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return JsonResponse({"status": "success", "message": "Password updated successfully."}, status=200)
            else:
                return JsonResponse({"error": "Invalid or expired reset link."}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"Reset password confirm error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
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
            User = get_user_model()
            default_member = User.objects.first()
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
            logger.error(f"Webhook error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
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
            logger.error(f"Update transaction error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=400)
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

@csrf_exempt
def dashboard_onboarding(request):
    if request.method == 'GET':
        settings_obj = SystemSettings.objects.first()
        
        has_api_key = bool(settings_obj and settings_obj.api_key and settings_obj.api_key != '••••••••••••')
        has_android_sync = Transaction.objects.filter(source='SMS_ANDROID').exists()
        has_ios_sync = Transaction.objects.filter(source='SMS_IOS').exists()
        
        has_email_sync = bool(settings_obj and settings_obj.imap_email and settings_obj.imap_password)
        
        completed_steps = sum([has_api_key, has_android_sync, has_ios_sync, has_email_sync])
        progress_percentage = int((completed_steps / 4.0) * 100)
        
        return JsonResponse({
            "has_api_key": has_api_key,
            "has_android_sync": has_android_sync,
            "has_ios_sync": has_ios_sync,
            "has_email_sync": has_email_sync,
            "progress_percentage": progress_percentage
        }, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

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
        masked_imap_password = ""
        if settings.imap_password:
            masked_imap_password = "••••••••••••"
            
        return JsonResponse({
            "active_ai_provider": settings.active_ai_provider,
            "openai_api_key_masked": "••••••••••••" if settings.openai_api_key else "",
            "anthropic_api_key_masked": "••••••••••••" if settings.anthropic_api_key else "",
            "gemini_api_key_masked": "••••••••••••" if settings.gemini_api_key else "",
            "deepseek_api_key_masked": "••••••••••••" if settings.deepseek_api_key else "",
            "groq_api_key_masked": "••••••••••••" if settings.groq_api_key else "",
            "has_api_key": bool(settings.openai_api_key or settings.anthropic_api_key or settings.gemini_api_key or settings.deepseek_api_key or settings.groq_api_key),
            "ai_model_mode": settings.ai_model_mode,
            "ai_model_tier": settings.ai_model_tier,
            "ai_custom_model": settings.ai_custom_model or "",
            "monthly_budget_target": float(settings.monthly_budget_target),
            "imap_email": settings.imap_email or "",
            "imap_password_masked": masked_imap_password,
            "has_imap": bool(settings.imap_email and settings.imap_password)
        }, status=200)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            if 'active_ai_provider' in data:
                settings.active_ai_provider = data['active_ai_provider']
            if 'openai_api_key' in data and data['openai_api_key'] and data['openai_api_key'] != '••••••••••••':
                settings.openai_api_key = data['openai_api_key']
            if 'anthropic_api_key' in data and data['anthropic_api_key'] and data['anthropic_api_key'] != '••••••••••••':
                settings.anthropic_api_key = data['anthropic_api_key']
            if 'gemini_api_key' in data and data['gemini_api_key'] and data['gemini_api_key'] != '••••••••••••':
                settings.gemini_api_key = data['gemini_api_key']
            if 'deepseek_api_key' in data and data['deepseek_api_key'] and data['deepseek_api_key'] != '••••••••••••':
                settings.deepseek_api_key = data['deepseek_api_key']
            if 'groq_api_key' in data and data['groq_api_key'] and data['groq_api_key'] != '••••••••••••':
                settings.groq_api_key = data['groq_api_key']
            if 'ai_model_mode' in data:
                settings.ai_model_mode = data['ai_model_mode']
            if 'ai_model_tier' in data:
                settings.ai_model_tier = data['ai_model_tier']
            if 'ai_custom_model' in data:
                settings.ai_custom_model = data['ai_custom_model']
            if 'monthly_budget_target' in data:
                settings.monthly_budget_target = data['monthly_budget_target']
            if 'imap_email' in data:
                settings.imap_email = data['imap_email']
            if 'imap_password' in data and data['imap_password'] and data['imap_password'] != '••••••••••••':
                settings.imap_password = data['imap_password']
            settings.save()
            return JsonResponse({"status": "success"}, status=200)
        except Exception as e:
            logger.error(f"Save settings error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=400)
            
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
            result = generate_financial_advice(agg_data, settings.active_ai_provider, settings.get_decrypted_api_key(), settings)
            
            if result.get("success"):
                return JsonResponse({"success": True, "analysis": result["analysis"]}, status=200)
            else:
                return JsonResponse({"success": False, "error": result.get("error")}, status=500)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except Exception as e:
            logger.error(f"AI Analysis error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
            
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
            logger.error(f"Create bill error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def scan_bills(request):
    if request.method == 'POST':
        try:
            detected_count = scan_for_recurring_bills()
            return JsonResponse({"status": "success", "detected_count": detected_count}, status=200)
        except Exception as e:
            logger.error(f"Scan bills error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)
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
            User = get_user_model()
            default_member = User.objects.first()
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
            logger.error(f"Manage account error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

import csv
from django.http import HttpResponse

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

from .tasks import poll_imap_emails

@csrf_exempt
def sync_email(request):
    if request.method == 'POST':
        try:
            # Dispatch huey task to run immediately in the background
            poll_imap_emails()
            return JsonResponse({"status": "success", "message": "Email sync triggered successfully. It will run in the background."})
        except Exception as e:
            logger.error(f"Sync email error: {e}", exc_info=True)
            return JsonResponse({"error": "Failed to trigger email sync."}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)
