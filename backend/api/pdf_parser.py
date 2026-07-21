import io
import re
import pdfplumber

def process_statement_pdf(file_bytes, password):
    """
    Attempts to decrypt the PDF and parse transactions.
    Returns a list of dicts: {"date": "...", "merchant": "...", "amount": 500, "type": "DEBIT"}
    """
    transactions = []
    
    try:
        with pdfplumber.open(io.BytesIO(file_bytes), password=password) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                # Basic heuristic regex for Indian Credit Card statements
                # e.g., "12/05/2023 14/05/2023 AMAZON PAY INDIA PRI 500.00 Cr" or "ZOMATO 250.00"
                # This is a very simplified placeholder regex designed to catch typical structures
                
                lines = text.split('\n')
                for line in lines:
                    # Look for date format DD/MM/YYYY or DD-MM-YYYY
                    date_match = re.search(r'(\d{2}[/\-]\d{2}[/\-]\d{4})', line)
                    if date_match:
                        date_str = date_match.group(1)
                        
                        # Look for amount at the end of the line
                        # e.g., 500.00 or 5,000.00 Cr
                        amount_match = re.search(r'([\d,]+\.\d{2})\s*(Cr)?\s*$', line, re.IGNORECASE)
                        if amount_match:
                            amount_str = amount_match.group(1).replace(',', '')
                            is_credit = bool(amount_match.group(2))
                            
                            # The merchant is the text between the date and the amount
                            # We'll just strip the date and amount from the line
                            merchant_str = line.replace(date_str, '').replace(amount_match.group(0), '').strip()
                            # If there are two dates (txn date and posting date), remove the second one
                            merchant_str = re.sub(r'\d{2}[/\-]\d{2}[/\-]\d{4}', '', merchant_str).strip()
                            
                            transactions.append({
                                "date": date_str,
                                "merchant": merchant_str,
                                "amount": float(amount_str),
                                "type": "CREDIT" if is_credit else "DEBIT"
                            })
                            
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return None
        
    return transactions
