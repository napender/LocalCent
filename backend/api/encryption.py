import os
from cryptography.fernet import Fernet

def get_cipher():
    key = os.environ.get('ENCRYPTION_KEY')
    if not key:
        return None
    try:
        return Fernet(key.encode('utf-8'))
    except Exception:
        return None

def encrypt_string(plaintext: str) -> str:
    if not plaintext:
        return plaintext
        
    cipher = get_cipher()
    if not cipher:
        print("Warning: ENCRYPTION_KEY not set. Storing plaintext.")
        return plaintext
        
    try:
        encrypted = cipher.encrypt(plaintext.encode('utf-8'))
        return encrypted.decode('utf-8')
    except Exception as e:
        print(f"Encryption failed: {e}")
        return plaintext

def decrypt_string(ciphertext: str) -> str:
    if not ciphertext:
        return ciphertext
        
    cipher = get_cipher()
    if not cipher:
        return ciphertext
        
    try:
        decrypted = cipher.decrypt(ciphertext.encode('utf-8'))
        return decrypted.decode('utf-8')
    except Exception:
        # If decryption fails (e.g., it was plaintext before migration or invalid token)
        # we return the original string for backwards compatibility
        return ciphertext
