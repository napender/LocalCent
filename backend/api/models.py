from django.db import models

class FamilyMember(models.Model):
    name = models.CharField(max_length=50)
    pin_code = models.CharField(max_length=4, unique=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'Admin' if self.is_admin else 'User'})"

from .encryption import encrypt_string, decrypt_string

class Account(models.Model):
    owner = models.ForeignKey(FamilyMember, on_delete=models.CASCADE, related_name='accounts')
    bank_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=50) # e.g., Credit, Debit
    last_four_digits = models.CharField(max_length=4, null=True, blank=True)
    pdf_password = models.CharField(max_length=100, null=True, blank=True)
    statement_day = models.IntegerField(null=True, blank=True) # 1-31
    due_day = models.IntegerField(null=True, blank=True) # 1-31

    def save(self, *args, **kwargs):
        if self.pdf_password and self.pdf_password != '••••••••••••':
            # Check if it's already encrypted (Fernet tokens start with gAAAAA)
            if not self.pdf_password.startswith('gAAAAA'):
                self.pdf_password = encrypt_string(self.pdf_password)
        super().save(*args, **kwargs)

    def get_decrypted_password(self):
        return decrypt_string(self.pdf_password)

    def __str__(self):
        return f"{self.bank_name} - {self.account_type} ({self.owner.name})"

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10) # CREDIT or DEBIT
    merchant_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="Uncategorized")
    timestamp = models.DateTimeField()
    source = models.CharField(max_length=50) # SMS_ANDROID, SMS_IOS, EMAIL, MANUAL
    deduplication_hash = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return f"{self.timestamp.date()} - {self.amount} @ {self.merchant_name}"

class SystemSettings(models.Model):
    active_ai_provider = models.CharField(max_length=50, default="openai")
    api_key = models.CharField(max_length=255, null=True, blank=True)
    monthly_budget_target = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    def save(self, *args, **kwargs):
        if self.api_key and self.api_key != '••••••••••••' and not self.api_key.startswith('gAAAAA'):
             self.api_key = encrypt_string(self.api_key)
        super().save(*args, **kwargs)

    def get_decrypted_api_key(self):
        return decrypt_string(self.api_key)

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name_plural = "System Settings"

class CategoryRule(models.Model):
    merchant_substring = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"'{self.merchant_substring}' -> {self.category}"

class RecurringBill(models.Model):
    merchant_name = models.CharField(max_length=200)
    expected_amount = models.DecimalField(max_digits=10, decimal_places=2)
    next_due_date = models.DateField()
    frequency = models.CharField(max_length=50, default="MONTHLY")
    is_auto_detected = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.merchant_name} - {self.expected_amount} ({self.frequency})"
