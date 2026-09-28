from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import List, Optional

ALLOWED_UNITS = ['Pieces', 'Boxes', 'Dozen', 'Sheets']

class CustomerBase(BaseModel):
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    hsn_code: Optional[str] = None
    unit: Optional[str] = None
    default_price: float
    gst_percentage: float = 0.0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SaleItemBase(BaseModel):
    product_id: Optional[int] = None
    description: str
    hsn_code: Optional[str] = None
    quantity: float
    unit: Optional[str] = 'Pieces'
    rate: float
    taxable_amount: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    amount: float = 0.0
    gst_percentage: float = 0.0

    @field_validator('unit', mode='before')
    @classmethod
    def validate_unit(cls, v):
        if v is None or v == '':
            return 'Pieces'
        if v not in ALLOWED_UNITS:
            # Accept existing data gracefully, default to Pieces for unknown
            return 'Pieces'
        return v

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    sale_id: int
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    customer_id: int
    total_amount: float
    cgst: float
    sgst: float
    grand_total: float

class SaleCreate(BaseModel):
    customer_id: int
    items: List[SaleItemCreate]

class Sale(SaleBase):
    id: int
    invoice_number: str
    date: datetime
    created_at: datetime
    status: str = "active"

    @field_validator('status', mode='before')
    @classmethod
    def validate_status(cls, v):
        # Rows predating the status column read back as NULL; treat them as active.
        return v or "active"

    class Config:
        from_attributes = True

class SaleWithDetails(Sale):
    customer: Customer
    items: List[SaleItem]
    
    class Config:
        from_attributes = True

class BusinessInfo(BaseModel):
    name: str
    address: str
    gstin: str
    phone: str
    bank_name: str
    account_number: str
    ifsc: str
    branch: str


# ============================================================
# PURCHASES MODULE SCHEMAS (strictly isolated)
# ============================================================

class PurchaseSupplierBase(BaseModel):
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class PurchaseSupplierCreate(PurchaseSupplierBase):
    pass

class PurchaseSupplier(PurchaseSupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseProductBase(BaseModel):
    name: str
    hsn_code: Optional[str] = None
    unit: Optional[str] = None
    default_price: float = 0.0
    gst_percentage: float = 0.0

class PurchaseProductCreate(PurchaseProductBase):
    pass

class PurchaseProduct(PurchaseProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseItemBase(BaseModel):
    product_id: Optional[int] = None
    description: str
    hsn_code: Optional[str] = None
    quantity: float
    unit: Optional[str] = 'Pieces'
    rate: float
    taxable_amount: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    amount: float = 0.0
    gst_percentage: float = 0.0

    @field_validator('unit', mode='before')
    @classmethod
    def validate_unit(cls, v):
        if v is None or v == '':
            return 'Pieces'
        if v not in ALLOWED_UNITS:
            return 'Pieces'
        return v

class PurchaseItemCreate(PurchaseItemBase):
    pass

class PurchaseItem(PurchaseItemBase):
    id: int
    purchase_id: int

    class Config:
        from_attributes = True


class PurchaseCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseItemCreate]
    amount_paid: float = 0.0
    invoice_date: Optional[datetime] = None

class PurchaseUpdate(BaseModel):
    supplier_id: int
    items: List[PurchaseItemCreate]
    amount_paid: float = 0.0
    invoice_date: Optional[datetime] = None


class Purchase(BaseModel):
    id: int
    bill_number: str
    supplier_id: int
    invoice_date: datetime
    total_amount: float
    cgst: float
    sgst: float
    grand_total: float
    amount_paid: float
    balance_due: float
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseWithDetails(Purchase):
    supplier: PurchaseSupplier
    items: List[PurchaseItem]

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    amount_paid: float
