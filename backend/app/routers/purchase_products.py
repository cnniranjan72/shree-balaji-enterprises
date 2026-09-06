from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/purchase-products", tags=["purchase-products"])


@router.post("", response_model=schemas.PurchaseProduct)
def create_purchase_product(product: schemas.PurchaseProductCreate, db: Session = Depends(get_db)):
    db_product = models.PurchaseProduct(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("", response_model=List[schemas.PurchaseProduct])
def get_purchase_products(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.PurchaseProduct)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.PurchaseProduct.name.ilike(search_filter)) |
            (models.PurchaseProduct.hsn_code.ilike(search_filter))
        )

    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=schemas.PurchaseProduct)
def get_purchase_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.PurchaseProduct).filter(models.PurchaseProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Purchase product not found")
    return product


@router.put("/{product_id}", response_model=schemas.PurchaseProduct)
def update_purchase_product(product_id: int, product: schemas.PurchaseProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.PurchaseProduct).filter(models.PurchaseProduct.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Purchase product not found")

    for key, value in product.model_dump().items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
def delete_purchase_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.PurchaseProduct).filter(models.PurchaseProduct.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Purchase product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Purchase product deleted successfully"}
