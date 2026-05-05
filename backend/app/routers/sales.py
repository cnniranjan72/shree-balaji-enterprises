from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..utils import generate_invoice_number, calculate_sale_totals

router = APIRouter(prefix="/sales", tags=["sales"])

@router.post("", response_model=schemas.SaleWithDetails)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == sale.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    invoice_number = generate_invoice_number(db)

    totals = calculate_sale_totals(sale.items)

    db_sale = models.Sale(
        invoice_number=invoice_number,
        customer_id=sale.customer_id,
        total_amount=totals["total_amount"],
        cgst=totals["cgst"],
        sgst=totals["sgst"],
        grand_total=totals["grand_total"]
    )

    db.add(db_sale)
    db.flush()

    for item in sale.items:
        db_item = models.SaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            description=item.description,
            hsn_code=item.hsn_code,
            quantity=item.quantity,
            rate=item.rate,
            amount=item.amount,
            gst_percentage=item.gst_percentage
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_sale)

    return db_sale

@router.get("", response_model=List[schemas.SaleWithDetails])
def get_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sales = db.query(models.Sale).order_by(models.Sale.date.desc()).offset(skip).limit(limit).all()
    return sales

@router.get("/{sale_id}", response_model=schemas.SaleWithDetails)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.get("/invoice/{invoice_number}", response_model=schemas.SaleWithDetails)
def get_sale_by_invoice(invoice_number: str, db: Session = Depends(get_db)):
    sale = db.query(models.Sale).filter(models.Sale.invoice_number == invoice_number).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return sale

@router.put("/{sale_id}", response_model=schemas.SaleWithDetails)
def update_sale(sale_id: int, sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    customer = db.query(models.Customer).filter(models.Customer.id == sale.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Delete existing items
    db.query(models.SaleItem).filter(models.SaleItem.sale_id == sale_id).delete()

    # Recalculate totals
    totals = calculate_sale_totals(sale.items)

    # Update sale
    db_sale.customer_id = sale.customer_id
    db_sale.total_amount = totals["total_amount"]
    db_sale.cgst = totals["cgst"]
    db_sale.sgst = totals["sgst"]
    db_sale.grand_total = totals["grand_total"]

    # Add new items
    for item in sale.items:
        db_item = models.SaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            description=item.description,
            hsn_code=item.hsn_code,
            quantity=item.quantity,
            rate=item.rate,
            amount=item.amount,
            gst_percentage=item.gst_percentage
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_sale)

    return db_sale

@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    db.delete(db_sale)
    db.commit()
    return {"message": "Sale deleted successfully"}
