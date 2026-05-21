# Stability Audit Report — Shree Balaji Enterprises GST Billing System

## Root Cause Findings

### 1. CRITICAL: Products API 500 Error
**Root Cause:** The `products` table in PostgreSQL was missing the `unit` column. The SQLAlchemy model defined `unit = Column(String, nullable=True)` but the actual database table never had this column added. Every query to `/products` failed with `UndefinedColumn: column products.unit does not exist`.

**Fix:** Ran `ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR` via migration script.

### 2. CORS Configuration Not Using Environment Variables
**Root Cause:** `main.py` had hardcoded origins list `["https://shree-balaji-enterprises.vercel.app", "http://localhost:3000"]`. The `settings.frontend_url` was loaded but never used in the CORS origins. Additionally, `http://localhost:5173` (Vite's default port) was missing.

**Fix:** CORS origins now dynamically include `settings.frontend_url` plus local dev origins (`localhost:3000`, `localhost:5173`).

### 3. Export GST Double-Counting Bug
**Root Cause:** The export router recalculated GST as `item.amount * item.gst_percentage / 100`, but `item.amount` is already the GST-inclusive line total (qty × rate). This calculated GST on top of an already-inclusive amount, then added it again in the "Total" column, producing inflated export values.

**Fix:** Export now uses stored `item.taxable_amount`, `item.cgst`, `item.sgst` values directly. Total = `item.amount` (which is already the inclusive line total).

### 4. Frontend API URL Missing Fallback
**Root Cause:** `const API_BASE_URL = import.meta.env.VITE_API_URL` had no fallback. If the env var wasn't set, all API calls would fail with undefined baseURL.

**Fix:** Added fallback: `import.meta.env.VITE_API_URL || 'http://localhost:8000'`

### 5. Deprecated Pydantic `.dict()` Usage
**Root Cause:** Routers used `customer.dict()` and `product.dict()` which is deprecated in Pydantic v2. While it still works, it generates deprecation warnings.

**Fix:** Replaced with `.model_dump()`.

### 6. Type Hints Causing Potential Issues
**Root Cause:** `limit: int = None` in customers router — `None` is not a valid `int`. FastAPI handles this gracefully but it's technically incorrect.

**Fix:** Changed to `limit: Optional[int] = None`.

### 7. Invoice Number Generation Fragility
**Root Cause:** `int(last_invoice.invoice_number.split('-')[-1])` would crash with ValueError if invoice format was ever corrupted.

**Fix:** Added try/except with fallback to count-based numbering.

---

## Migration SQL

File: `backend/migration.sql` and `backend/run_migration.py`

Run the migration script:
```bash
cd backend
python run_migration.py
```

This safely:
- Adds missing columns (IF NOT EXISTS)
- Backfills GST values for existing sale_items
- Never drops tables or columns
- Safe to run multiple times (idempotent)

---

## Environment Configuration

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=Your Address
BUSINESS_GSTIN=Your GSTIN
BUSINESS_PHONE=Your Phone
BUSINESS_BANK_NAME=Bank Name
BUSINESS_ACCOUNT_NUMBER=Account Number
BUSINESS_IFSC=IFSC Code
BUSINESS_BRANCH=Branch Name
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

For production (Render), set:
```env
FRONTEND_URL=https://shree-balaji-enterprises.vercel.app
ENVIRONMENT=production
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_ADMIN_PIN=4973
```

For production (Vercel), set:
```env
VITE_API_URL=https://shree-balaji-enterprises.onrender.com
```

### Flutter Config
```dart
// lib/config.dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000', // Android emulator
  );
}
```

For physical device, pass: `--dart-define=API_BASE_URL=http://192.168.x.x:8000`

---

## Local Development Steps

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python run_migration.py      # First time only
python run.py
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### Quick Start (Windows)
```bash
start-backend.bat    # Terminal 1
start-frontend.bat   # Terminal 2
```

---

## Production Deployment Steps

### Backend (Render)
1. Set environment variables in Render dashboard:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `BUSINESS_NAME`, `BUSINESS_ADDRESS`, etc.
   - `FRONTEND_URL=https://shree-balaji-enterprises.vercel.app`
   - `ENVIRONMENT=production`
2. Deploy from git (auto-detects `requirements.txt`)
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Set environment variable in Vercel dashboard:
   - `VITE_API_URL=https://shree-balaji-enterprises.onrender.com`
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Smoke Test Checklist

### Local
- [ ] `GET http://localhost:8000/health` → `{"status": "healthy"}`
- [ ] `GET http://localhost:8000/products?search=` → 200 with product list
- [ ] `GET http://localhost:8000/customers?search=` → 200 with customer list
- [ ] `GET http://localhost:8000/sales` → 200 with sales list
- [ ] `GET http://localhost:8000/business` → 200 with business info
- [ ] Frontend loads at http://localhost:5173
- [ ] PIN login works (default: 4973)
- [ ] Dashboard shows stats
- [ ] Products page loads and search works
- [ ] Customers page loads and search works
- [ ] Create Bill flow works end-to-end
- [ ] Invoice page renders correctly
- [ ] Export monthly/all downloads Excel file

### Production
- [ ] Backend health check passes
- [ ] Frontend loads on Vercel
- [ ] No CORS errors in browser console
- [ ] Products API returns data
- [ ] Customers search works
- [ ] Bill creation works
- [ ] Invoice print works
- [ ] Export downloads work

---

## Files Changed

| File | Change |
|------|--------|
| `backend/app/main.py` | CORS now env-driven, includes localhost:5173 |
| `backend/app/config.py` | Better .env file discovery, production frontend URL default |
| `backend/app/routers/products.py` | `Optional[str]` type hints, `.model_dump()` |
| `backend/app/routers/customers.py` | `Optional` types, `.model_dump()`, safe delete |
| `backend/app/routers/sales.py` | Direct `item.unit` access (not getattr) |
| `backend/app/routers/export.py` | Fixed GST double-counting, uses stored values |
| `backend/app/utils.py` | Safe invoice number generation, proper exception handling |
| `backend/.env` | Local dev config (ENVIRONMENT=development) |
| `backend/.env.example` | Updated template |
| `backend/run_migration.py` | New: migration script |
| `backend/migration.sql` | New: raw SQL for reference |
| `frontend/src/api.js` | Added fallback URL |
| `frontend/src/utils/apiErrorHandler.js` | Less aggressive error alerts |
| `frontend/.env` | Added VITE_ADMIN_PIN |
| `frontend/.env.example` | Updated template |
| `frontend/vite.config.js` | Port changed to 5173 |
| `start-frontend.bat` | Updated port reference |
