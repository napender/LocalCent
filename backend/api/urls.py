from django.urls import path
from .views import login_view, webhook_sms, list_transactions, dashboard_summary, system_settings, ai_analyze, update_transaction, list_or_create_bills, scan_bills, manage_accounts, export_transactions_csv

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('webhooks/sms/', webhook_sms, name='webhook_sms'),
    path('transactions/', list_transactions, name='list_transactions'),
    path('transactions/<int:tx_id>/', update_transaction, name='update_transaction'),
    path('dashboard/summary/', dashboard_summary, name='dashboard_summary'),
    path('settings/', system_settings, name='system_settings'),
    path('ai/analyze/', ai_analyze, name='ai_analyze'),
    path('bills/', list_or_create_bills, name='list_or_create_bills'),
    path('bills/scan/', scan_bills, name='scan_bills'),
    path('accounts/', manage_accounts, name='manage_accounts'),
    path('export/transactions/', export_transactions_csv, name='export_transactions'),
]

