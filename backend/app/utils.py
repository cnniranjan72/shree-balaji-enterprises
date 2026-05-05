from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from . import models
from num2words import num2words

def generate_invoice_number(db: Session) -> str:
    now = datetime.now()
    year = now.year
    month = now.month
    
    last_invoice = db.query(models.Sale).filter(
        extract('year', models.Sale.date) == year,
        extract('month', models.Sale.date) == month
    ).order_by(models.Sale.id.desc()).first()
    
    if last_invoice:
        last_num = int(last_invoice.invoice_number.split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"INV-{year}-{month:02d}-{new_num:03d}"

def amount_to_words(amount: float) -> str:
    try:
        rupees = int(amount)
        paise = int((amount - rupees) * 100)
        
        words = num2words(rupees, lang='en_IN').title()
        
        if paise > 0:
            paise_words = num2words(paise, lang='en_IN').title()
            return f"{words} Rupees and {paise_words} Paise Only"
        else:
            return f"{words} Rupees Only"
    except:
        return "Amount conversion error"

def calculate_sale_totals(items: list) -> dict:
    total_amount = 0.0
    total_cgst = 0.0
    total_sgst = 0.0
    
    for item in items:
        item_amount = item.quantity * item.rate
        item_gst = (item_amount * item.gst_percentage) / 100
        item_cgst = item_gst / 2
        item_sgst = item_gst / 2
        
        total_amount += item_amount
        total_cgst += item_cgst
        total_sgst += item_sgst
    
    grand_total = total_amount + total_cgst + total_sgst
    
    return {
        "total_amount": round(total_amount, 2),
        "cgst": round(total_cgst, 2),
        "sgst": round(total_sgst, 2),
        "grand_total": round(grand_total, 2)
    }
