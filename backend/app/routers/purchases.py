from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..utils import generate_purchase_bill_number, calculate_purchase_totals, calculate_item_values

router = APIRouter(prefix="/purchases", tags=["purchases"])


def _compute_balance(grand_total: float, amount_paid: float) -> tuple:
    """Returns (balance_due, payment_status)."""
    balance = round(grand_total - amount_paid, 2)
    if balance <= 0:
        return 0.0, "Paid"
    elif amount_paid > 0:
        return balance, "Partial"
    else:
        return balance, "Unpaid"


@router.post("", response_model=schemas.PurchaseWithDetails)
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    supplier = db.query(models.PurchaseSupplier).filter(models.PurchaseSupplier.id == purchase.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    bill_number = generate_purchase_bill_number(db)
    totals = calculate_purchase_totals(purchase.items)
    balance, status = _compute_balance(totals["grand_total"], purchase.amount_paid)

    db_purchase = models.Purchase(
        bill_number=bill_number,
        supplier_id=purchase.supplier_id,
        total_amount=totals["total_amount"],
        cgst=totals["cgst"],
        sgst=totals["sgst"],
        grand_total=totals["grand_total"],
        amount_paid=purchase.amount_paid,
        balance_due=balance,
        payment_status=status,
    )

    if purchase.invoice_date:
        db_purchase.invoice_date = purchase.invoice_date

    db.add(db_purchase)
    db.flush()

    for item in purchase.items:
        values = calculate_item_values(item)
        db_item = models.PurchaseItem(
            purchase_id=db_purchase.id,
            product_id=item.product_id,
            description=item.description,
            hsn_code=item.hsn_code,
            quantity=item.quantity,
            unit=item.unit,
            rate=item.rate,
            taxable_amount=values['taxable_amount'],
            cgst=values['cgst'],
            sgst=values['sgst'],
            amount=values['amount'],
            gst_percentage=item.gst_percentage
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_purchase)

    return db_purchase


@router.get("", response_model=List[schemas.PurchaseWithDetails])
def get_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    purchases = db.query(models.Purchase).order_by(models.Purchase.invoice_date.desc()).offset(skip).limit(limit).all()
    return purchases


@router.get("/{purchase_id}", response_model=schemas.PurchaseWithDetails)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase


@router.get("/bill/{bill_number}", response_model=schemas.PurchaseWithDetails)
def get_purchase_by_bill(bill_number: str, db: Session = Depends(get_db)):
    purchase = db.query(models.Purchase).filter(models.Purchase.bill_number == bill_number).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase bill not found")
    return purchase


@router.put("/{purchase_id}", response_model=schemas.PurchaseWithDetails)
def update_purchase(purchase_id: int, purchase: schemas.PurchaseUpdate, db: Session = Depends(get_db)):
    db_purchase = db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    supplier = db.query(models.PurchaseSupplier).filter(models.PurchaseSupplier.id == purchase.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Delete existing items first (they will be recreated)
    db.query(models.PurchaseItem).filter(models.PurchaseItem.purchase_id == purchase_id).delete()

    totals = calculate_purchase_totals(purchase.items)
    balance, status = _compute_balance(totals["grand_total"], purchase.amount_paid)

    db_purchase.supplier_id = purchase.supplier_id
    db_purchase.total_amount = totals["total_amount"]
    db_purchase.cgst = totals["cgst"]
    db_purchase.sgst = totals["sgst"]
    db_purchase.grand_total = totals["grand_total"]
    db_purchase.amount_paid = purchase.amount_paid
    db_purchase.balance_due = balance
    db_purchase.payment_status = status

    if purchase.invoice_date:
        db_purchase.invoice_date = purchase.invoice_date

    for item in purchase.items:
        values = calculate_item_values(item)
        db_item = models.PurchaseItem(
            purchase_id=db_purchase.id,
            product_id=item.product_id,
            description=item.description,
            hsn_code=item.hsn_code,
            quantity=item.quantity,
            unit=item.unit,
            rate=item.rate,
            taxable_amount=values['taxable_amount'],
            cgst=values['cgst'],
            sgst=values['sgst'],
            amount=values['amount'],
            gst_percentage=item.gst_percentage
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_purchase)

    return db_purchase


@router.patch("/{purchase_id}/payment", response_model=schemas.PurchaseWithDetails)
def update_purchase_payment(purchase_id: int, payment: schemas.PaymentUpdate, db: Session = Depends(get_db)):
    """Update the amount paid for a purchase. Recomputes balance due and status."""
    db_purchase = db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    amount_paid = round(float(payment.amount_paid), 2)
    if amount_paid < 0:
        raise HTTPException(status_code=400, detail="Amount paid cannot be negative")
    if amount_paid > db_purchase.grand_total:
        raise HTTPException(status_code=400, detail="Amount paid cannot exceed grand total")

    db_purchase.amount_paid = amount_paid
    balance, status = _compute_balance(db_purchase.grand_total, amount_paid)
    db_purchase.balance_due = balance
    db_purchase.payment_status = status

    db.commit()
    db.refresh(db_purchase)

    return db_purchase


@router.delete("/{purchase_id}")
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    db.delete(db_purchase)
    db.commit()
    return {"message": "Purchase deleted successfully"}
