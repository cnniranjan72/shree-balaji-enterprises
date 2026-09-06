from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/purchase-suppliers", tags=["purchase-suppliers"])


@router.post("", response_model=schemas.PurchaseSupplier)
def create_purchase_supplier(supplier: schemas.PurchaseSupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.PurchaseSupplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.get("", response_model=List[schemas.PurchaseSupplier])
def get_purchase_suppliers(skip: int = 0, limit: Optional[int] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.PurchaseSupplier)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.PurchaseSupplier.name.ilike(search_filter)) |
            (models.PurchaseSupplier.phone.ilike(search_filter)) |
            (models.PurchaseSupplier.gstin.ilike(search_filter))
        )

    if limit is not None:
        suppliers = query.offset(skip).limit(limit).all()
    else:
        suppliers = query.offset(skip).all()

    return suppliers


@router.get("/{supplier_id}", response_model=schemas.PurchaseSupplier)
def get_purchase_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.PurchaseSupplier).filter(models.PurchaseSupplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=schemas.PurchaseSupplier)
def update_purchase_supplier(supplier_id: int, supplier: schemas.PurchaseSupplierCreate, db: Session = Depends(get_db)):
    db_supplier = db.query(models.PurchaseSupplier).filter(models.PurchaseSupplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    for key, value in supplier.model_dump().items():
        setattr(db_supplier, key, value)

    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.delete("/{supplier_id}")
def delete_purchase_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(models.PurchaseSupplier).filter(models.PurchaseSupplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    purchase_count = db.query(models.Purchase).filter(models.Purchase.supplier_id == supplier_id).count()
    if purchase_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete supplier with {purchase_count} existing purchase(s). Delete the purchases first.")

    db.delete(db_supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}
