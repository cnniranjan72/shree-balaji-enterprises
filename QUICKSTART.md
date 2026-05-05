# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Neon Database (2 minutes)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Click "Create Project"
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### Step 2: Backend Setup (1 minute)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create `.env` file:
```env
DATABASE_URL=your_neon_connection_string_here
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=123 Main Street, City
BUSINESS_GSTIN=22AAAAA0000A1Z5
BUSINESS_PHONE=+91-9876543210
BUSINESS_BANK_NAME=State Bank of India
BUSINESS_ACCOUNT_NUMBER=1234567890
BUSINESS_IFSC=SBIN0001234
BUSINESS_BRANCH=Main Branch
```

Run backend:
```bash
python run.py
```

### Step 3: Frontend Setup (1 minute)

Open new terminal:
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Start Using (1 minute)

1. Open browser: `http://localhost:3000`
2. Add a customer
3. Add a product
4. Create your first bill!

## 📱 First Bill Workflow

1. **Add Customer**
   - Click "Customers" → "Add Customer"
   - Enter: Name, GSTIN, Phone, Address
   - Click "Save"

2. **Add Product**
   - Click "Products" → "Add Product"
   - Enter: Name, HSN Code, Price, GST%
   - Click "Save"

3. **Create Bill**
   - Click "Create Bill"
   - Select customer
   - Select product (or enter custom)
   - Adjust quantity/rate
   - Click "Create Bill"

4. **Print Invoice**
   - Click "Print Invoice"
   - Invoice opens in print-ready format

## 🎯 Common Tasks

### Export Monthly Sales
1. Go to "Export" page
2. Select month and year
3. Click "Export Monthly Data"
4. Excel file downloads automatically

### View All Sales
1. Click "Sales" in navigation
2. See all invoices
3. Click eye icon to view/print

### Search Customers/Products
- Use search box at top of list
- Searches by name, GSTIN, phone, HSN

## ⚡ Tips

- **Custom Products**: You can enter product details manually in billing without adding to product list
- **Edit Prices**: Rates can be edited per invoice
- **GST Calculation**: Automatic - just enter GST%
- **Invoice Numbers**: Auto-generated as INV-YYYY-MM-XXX

## 🆘 Quick Fixes

**Backend won't start?**
- Check if virtual environment is activated
- Verify DATABASE_URL in .env

**Frontend won't start?**
- Delete node_modules
- Run `npm install` again

**Can't connect to database?**
- Check Neon dashboard - database might be paused
- Click "Resume" in Neon dashboard

**Print not working?**
- Use Chrome/Edge browser
- Check printer settings

## 📞 Need Help?

Check the main README.md for detailed documentation.
