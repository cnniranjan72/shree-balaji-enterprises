# Environment Configuration Guide

## 🌐 Environment-Driven Configuration

This system is fully configurable through environment variables with no hardcoded URLs.

---

## 🔧 Backend Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database Configuration (Required)
DATABASE_URL=postgresql://user:password@host/database

# Business Information
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=Your Business Address
BUSINESS_GSTIN=Your GSTIN
BUSINESS_PHONE=Your Phone Number
BUSINESS_BANK_NAME=Bank Name
BUSINESS_ACCOUNT_NUMBER=Account Number
BUSINESS_IFSC=IFSC Code
BUSINESS_BRANCH=Branch Name

# URL Configuration
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
```

### Running Backend

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 💻 Frontend Configuration

### Environment Variables

Create `.env` file in `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Environment (optional, for debugging)
VITE_ENVIRONMENT=development
```

### Running Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Flutter Configuration

Flutter uses compile-time environment variables passed via `--dart-define`.

### Development Build

```bash
cd mobile_app
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000 --dart-define=WEB_BASE_URL=http://10.0.2.2:3000
```

### Production Build

```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://your-backend.onrender.com \
  --dart-define=WEB_BASE_URL=https://your-frontend.vercel.app
```

### Environment Variables Available

- `API_BASE_URL`: Backend API URL
- `WEB_BASE_URL`: Frontend web URL (for invoice printing)
- `ENVIRONMENT`: Environment name (development/production)

---

## 🚀 Production Environment Setup

### Backend (Render/Railway)

```env
DATABASE_URL=postgresql://user:password@host/database
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=Your Business Address
BUSINESS_GSTIN=Your GSTIN
BUSINESS_PHONE=Your Phone Number
BUSINESS_BANK_NAME=Bank Name
BUSINESS_ACCOUNT_NUMBER=Account Number
BUSINESS_IFSC=IFSC Code
BUSINESS_BRANCH=Branch Name
BACKEND_BASE_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production
```

### Frontend (Vercel/Netlify)

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_ENVIRONMENT=production
```

### Flutter (Production APK)

```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://your-backend.onrender.com \
  --dart-define=WEB_BASE_URL=https://your-frontend.vercel.app \
  --dart-define=ENVIRONMENT=production
```

---

## 🔍 Environment Validation

The system validates required environment variables at startup:

### Backend Validation
- `DATABASE_URL` is required
- Logs configuration in development mode

### Frontend Validation
- Falls back to `http://localhost:8000` if `VITE_API_URL` not set
- Logs configuration in development mode

### Flutter Validation
- Uses sensible defaults for development
- Logs configuration in development mode

---

## 🛠️ Local Development Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
python -m uvicorn app.main:app --host localhost --port 8000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL
npm install
npm run dev
```

### 3. Flutter

```bash
cd mobile_app
flutter run --dart-define=API_BASE_URL=http://localhost:8000 --dart-define=WEB_BASE_URL=http://localhost:3000
```

---

## 📋 Environment Files Reference

### Backend `.env.example`
```
DATABASE_URL=postgresql://user:password@host/database
BUSINESS_NAME=Shree Balaji Enterprises
BUSINESS_ADDRESS=Your Business Address
BUSINESS_GSTIN=Your GSTIN
BUSINESS_PHONE=Your Phone Number
BUSINESS_BANK_NAME=Bank Name
BUSINESS_ACCOUNT_NUMBER=Account Number
BUSINESS_IFSC=IFSC Code
BUSINESS_BRANCH=Branch Name
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend `.env.example`
```
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Flutter `.env.example`
```
# Flutter Environment Variables Example
# These are passed at build time using --dart-define

API_BASE_URL=http://10.0.2.2:8000
WEB_BASE_URL=http://10.0.2.2:3000
ENVIRONMENT=development

# Build command example:
# flutter build apk --dart-define=API_BASE_URL=https://your-backend.onrender.com --dart-define=WEB_BASE_URL=https://your-frontend.vercel.app
```

---

## ✅ Benefits of Environment-Driven Setup

1. **No Hardcoded URLs**: All URLs are configurable
2. **Easy Deployment**: Same code works in all environments
3. **Security**: Secrets not committed to code
4. **Flexibility**: Easy to switch between environments
5. **Maintainability**: Centralized configuration management

---

## 🔄 Switching Environments

### From Local to Production

1. Update backend `.env` with production URLs
2. Set frontend environment variables in deployment platform
3. Build Flutter with production `--dart-define` values

### From Production to Staging

1. Create separate environment files
2. Use different deployment targets
3. Adjust URLs accordingly

---

## 🚨 Important Notes

- Never commit actual `.env` files to version control
- Use `.env.example` as templates
- Test all environment configurations
- Validate URLs are accessible in production
- Monitor environment variable usage in logs
