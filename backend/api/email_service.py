import logging
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

logger = logging.getLogger(__name__)

def send_password_reset_email(user, request=None):
    """
    Generates a secure token and sends a password reset email to the user.
    """
    try:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # In a real production setup, we would read the frontend host from settings or request
        # For this local app, we'll try to infer it from the request's origin or default to localhost:5173
        frontend_host = "http://localhost:5173"
        if request:
            origin = request.headers.get('Origin')
            if origin:
                frontend_host = origin
                
        reset_link = f"{frontend_host}/reset-password?uid={uid}&token={token}"
        
        subject = "LocalCent - Password Reset"
        message = (
            f"Hello {user.first_name or user.email},\n\n"
            "We received a request to reset the password for your LocalCent account.\n"
            "If you made this request, please click the link below to set a new password:\n\n"
            f"{reset_link}\n\n"
            "If you didn't request this, you can safely ignore this email.\n\n"
            "Thanks,\nThe LocalCent Team"
        )
        
        from_email = getattr(settings, 'EMAIL_HOST_USER', 'noreply@localcent.app')
        if not from_email:
            from_email = 'noreply@localcent.app'
            
        send_mail(
            subject,
            message,
            from_email,
            [user.email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {e}")
        return False
