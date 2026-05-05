from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

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
    rate: float
    amount: float
    gst_percentage: float = 0.0

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
