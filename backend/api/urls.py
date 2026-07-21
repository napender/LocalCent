from django.urls import path
from .views import login_view, auth_status, setup_wizard, recover_account, reset_password, forgot_password_email, reset_password_confirm, webhook_sms, list_transactions, dashboard_summary, dashboard_onboarding, system_settings, ai_analyze, ai_chat, update_transaction, list_or_create_bills, scan_bills, manage_accounts, export_transactions_csv, sync_email

urlpatterns = [
    path('auth/status/', auth_status, name='auth_status'),
    path('auth/setup/', setup_wizard, name='setup_wizard'),
    path('auth/login/', login_view, name='login'),
    path('auth/recover/', recover_account, name='recover_account'),
    path('auth/reset-password/', reset_password, name='reset_password'),
    path('auth/forgot-password/email/', forgot_password_email, name='forgot_password_email'),
    path('auth/reset-password/confirm/', reset_password_confirm, name='reset_password_confirm'),
    path('webhooks/sms/', webhook_sms, name='webhook_sms'),
    path('transactions/', list_transactions, name='list_transactions'),
    path('transactions/<int:tx_id>/', update_transaction, name='update_transaction'),
    path('dashboard/summary/', dashboard_summary, name='dashboard_summary'),
    path('dashboard/onboarding/', dashboard_onboarding, name='dashboard_onboarding'),
    path('settings/', system_settings, name='system_settings'),
    path('settings/sync-email/', sync_email, name='sync_email'),
    path('ai/analyze/', ai_analyze, name='ai_analyze'),
    path('ai/chat/', ai_chat, name='ai_chat'),
    path('bills/', list_or_create_bills, name='list_or_create_bills'),
    path('bills/scan/', scan_bills, name='scan_bills'),
    path('accounts/', manage_accounts, name='manage_accounts'),
    path('export/transactions/', export_transactions_csv, name='export_transactions'),
]

