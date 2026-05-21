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


def calculate_item_values(item: object) -> dict:
    quantity = float(item.quantity or 0)
    rate = float(item.rate or 0)
    gst_percentage = float(item.gst_percentage or 0)
    line_total = round(quantity * rate, 2)

    if gst_percentage > 0:
        taxable_amount = round(line_total / (1 + gst_percentage / 100), 2)
    else:
        taxable_amount = line_total

    gst_total = round(line_total - taxable_amount, 2)
    cgst = round(gst_total / 2, 2)
    sgst = round(gst_total / 2, 2)

    return {
        'amount': line_total,
        'taxable_amount': taxable_amount,
        'cgst': cgst,
        'sgst': sgst,
        'gst_total': gst_total,
    }


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
    total_taxable = 0.0
    total_cgst = 0.0
    total_sgst = 0.0
    total_grand = 0.0

    for item in items:
        values = calculate_item_values(item)
        total_taxable += values['taxable_amount']
        total_cgst += values['cgst']
        total_sgst += values['sgst']
        total_grand += values['amount']

    return {
        "total_amount": round(total_taxable, 2),
        "cgst": round(total_cgst, 2),
        "sgst": round(total_sgst, 2),
        "grand_total": round(total_grand, 2)
    }
