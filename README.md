# GST Billing System

A production-ready MVP for small business billing with GST invoice generation, customer/product management, and Excel export functionality.

## 🚀 Features

### Core Functionality
- **Customer Management**: Add, search, edit, and manage customer details (name, GSTIN, address, phone)
- **Product Management**: Maintain product catalog with HSN codes, prices, and GST percentages
- **Billing System**: Create GST-compliant invoices with automatic calculations
- **Invoice Generation**: Professional, printable A4 invoices with business details
- **Excel Export**: Export monthly or all sales data to Excel format
- **Auto Invoice Numbering**: Format: INV-YYYY-MM-XXX

### Technical Features
- RESTful API with FastAPI
- PostgreSQL database (Neon compatible)
- React frontend with TailwindCSS
- Responsive design
- Print-ready invoices
- GST calculations (CGST/SGST)
- Amount in words conversion

## 📋 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database (Neon)
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **Pandas** - Excel export

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database (Neon account recommended)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Configure environment variables**

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@host/database
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=Your Business Address, City, State - PIN
BUSINESS_GSTIN=22AAAAA0000A1Z5
BUSINESS_PHONE=+91-9876543210
BUSINESS_BANK_NAME=State Bank of India
BUSINESS_ACCOUNT_NUMBER=1234567890
BUSINESS_IFSC=SBIN0001234
BUSINESS_BRANCH=Main Branch
```

**Getting Neon Database URL:**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (format: `postgresql://user:password@host/database`)

6. **Run the backend**
```bash
python run.py
```

Backend will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the frontend**
```bash
npm run dev
```

Frontend will start at: `http://localhost:3000`

## 📁 Project Structure

```
Shree Balaji Enterprises/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── customers.py
│   │   │   ├── products.py
│   │   │   ├── sales.py
│   │   │   ├── export.py
│   │   │   └── business.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── utils.py
│   │   └── main.py
│   ├── .env
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── CreateBill.jsx
│   │   │   ├── Invoice.jsx
│   │   │   ├── Sales.jsx
│   │   │   └── Export.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🗄️ Database Schema

### Tables

**customers**
- id (Primary Key)
- name
- gstin
- address
- phone
- created_at

**products**
- id (Primary Key)
- name
- hsn_code
- default_price
- gst_percentage
- created_at

**sales**
- id (Primary Key)
- invoice_number (Unique)
- customer_id (Foreign Key)
- date
- total_amount
- cgst
- sgst
- grand_total
- created_at

**sale_items**
- id (Primary Key)
- sale_id (Foreign Key)
- product_id (Foreign Key, nullable)
- description
- hsn_code
- quantity
- rate
- amount
- gst_percentage

## 🔌 API Endpoints

### Customers
- `GET /customers` - List all customers (with search)
- `POST /customers` - Create customer
- `GET /customers/{id}` - Get customer by ID
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer

### Products
- `GET /products` - List all products (with search)
- `POST /products` - Create product
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Sales
- `GET /sales` - List all sales
- `POST /sales` - Create sale/invoice
- `GET /sales/{id}` - Get sale by ID
- `GET /sales/invoice/{invoice_number}` - Get sale by invoice number
- `DELETE /sales/{id}` - Delete sale

### Export
- `GET /export/monthly?month=MM&year=YYYY` - Export monthly sales to Excel
- `GET /export/all` - Export all sales to Excel

### Business
- `GET /business` - Get business information

## 📝 Usage Guide

### 1. Initial Setup
1. Add your business details in the `.env` file
2. Add customers via the Customers page
3. Add products via the Products page

### 2. Creating a Bill
1. Go to "Create Bill" page
2. Select a customer from the dropdown
3. Add items:
   - Select from product list (auto-fills details) OR
   - Enter custom product details
4. Adjust quantities and rates as needed
5. Review the auto-calculated totals
6. Click "Create Bill"

### 3. Viewing & Printing Invoices
1. After creating a bill, you'll be redirected to the invoice
2. Click "Print Invoice" to print
3. The invoice is A4-ready with proper formatting

### 4. Exporting Data
1. Go to "Export" page
2. Choose monthly export (select month/year) OR export all data
3. Excel file will download automatically

## 🎨 Features Breakdown

### Invoice Features
- Auto-generated invoice number (INV-YYYY-MM-XXX)
- Business details header
- Customer details
- Itemized product table
- HSN codes
- GST breakdown (CGST/SGST)
- Grand total
- Amount in words
- Bank details
- Signature placeholders
- Print-ready format

### Calculation Logic
- Item Amount = Quantity × Rate
- GST Amount = Item Amount × GST%
- CGST = GST Amount ÷ 2
- SGST = GST Amount ÷ 2
- Grand Total = Total Amount + CGST + SGST

## 🔒 Security Notes

- No authentication implemented (as per MVP requirements)
- For production use, add:
  - User authentication
  - Role-based access control
  - API rate limiting
  - Input sanitization
  - HTTPS enforcement

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
- Verify DATABASE_URL in `.env`
- Check Neon database is active
- Ensure network connectivity

**Import errors:**
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

### Frontend Issues

**Port already in use:**
- Change port in `vite.config.js`
- Or kill process using port 3000

**API connection error:**
- Ensure backend is running on port 8000
- Check CORS settings in backend

**Build errors:**
- Delete `node_modules` and reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## 📦 Production Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Use production database URL
3. Set `reload=False` in `run.py`
4. Use gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Update API base URL in `api.js`

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check browser console for frontend errors
4. Check backend logs for API errors

## 📄 License

This project is created for Shree Balaji Enterprises. All rights reserved.

## 🎯 Future Enhancements (Optional)

- User authentication
- Multi-user support
- Email invoice functionality
- Payment tracking
- Inventory management
- Reports and analytics
- Mobile app
- Barcode scanning
- Multiple tax rates
- Discount management

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Developed for:** Shree Balaji Enterprises
