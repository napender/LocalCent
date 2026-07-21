from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = None # Remove username, use email instead
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class SecurityAnswer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='security_answers')
    question_text = models.CharField(max_length=255)
    hashed_answer = models.CharField(max_length=128)

    def save(self, *args, **kwargs):
        if self.hashed_answer and not self.hashed_answer.startswith('pbkdf2_') and not self.hashed_answer.startswith('argon2'):
            self.hashed_answer = make_password(self.hashed_answer.lower().strip())
        super().save(*args, **kwargs)

    def check_answer(self, raw_answer):
        return check_password(raw_answer.lower().strip(), self.hashed_answer)

    def __str__(self):
        return f"Q: {self.question_text} for {self.user.email}"

from .encryption import encrypt_string, decrypt_string

class Account(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
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
    openai_api_key = models.CharField(max_length=255, null=True, blank=True)
    anthropic_api_key = models.CharField(max_length=255, null=True, blank=True)
    gemini_api_key = models.CharField(max_length=255, null=True, blank=True)
    deepseek_api_key = models.CharField(max_length=255, null=True, blank=True)
    groq_api_key = models.CharField(max_length=255, null=True, blank=True)
    ai_model_mode = models.CharField(max_length=20, default="simple")
    ai_model_tier = models.CharField(max_length=20, default="fast")
    ai_custom_model = models.CharField(max_length=100, null=True, blank=True)
    monthly_budget_target = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    imap_email = models.EmailField(null=True, blank=True)
    imap_password = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        for key_field in ['openai_api_key', 'anthropic_api_key', 'gemini_api_key', 'deepseek_api_key', 'groq_api_key']:
            val = getattr(self, key_field)
            if val and val != '••••••••••••' and not val.startswith('gAAAAA'):
                setattr(self, key_field, encrypt_string(val))
        if self.imap_password and self.imap_password != '••••••••••••' and not self.imap_password.startswith('gAAAAA'):
             self.imap_password = encrypt_string(self.imap_password)
        super().save(*args, **kwargs)

    def get_decrypted_api_key(self):
        provider = self.active_ai_provider.lower()
        key_to_use = None
        if provider == 'openai':
            key_to_use = self.openai_api_key
        elif provider == 'anthropic':
            key_to_use = self.anthropic_api_key
        elif provider == 'gemini':
            key_to_use = self.gemini_api_key
        elif provider == 'deepseek':
            key_to_use = self.deepseek_api_key
        elif provider == 'groq':
            key_to_use = self.groq_api_key
            
        if not key_to_use: return None
        return decrypt_string(key_to_use)

    def get_decrypted_imap_password(self):
        if not self.imap_password: return None
        return decrypt_string(self.imap_password)

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
