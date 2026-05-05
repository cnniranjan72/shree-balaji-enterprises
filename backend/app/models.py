from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gstin = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sales = relationship("Sale", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hsn_code = Column(String, nullable=True)
    default_price = Column(Float, nullable=False)
    gst_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sale_items = relationship("SaleItem", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    grand_total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    description = Column(String, nullable=False)
    hsn_code = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    gst_percentage = Column(Float, default=0.0)
    
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
