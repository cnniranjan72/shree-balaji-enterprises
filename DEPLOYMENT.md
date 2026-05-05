# Deployment Guide

## 🚀 Production Deployment

### Option 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up for free

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: gst-billing-api
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Instance Type**: Free

3. **Add Environment Variables**
   - Add all variables from `.env`:
     - DATABASE_URL
     - BUSINESS_NAME
     - BUSINESS_ADDRESS
     - BUSINESS_GSTIN
     - BUSINESS_PHONE
     - BUSINESS_BANK_NAME
     - BUSINESS_ACCOUNT_NUMBER
     - BUSINESS_IFSC
     - BUSINESS_BRANCH

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the URL (e.g., `https://gst-billing-api.onrender.com`)

### Option 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Select `backend` folder

3. **Configure**
   - Railway auto-detects Python
   - Add environment variables in Settings
   - Railway provides PostgreSQL if needed

4. **Deploy**
   - Automatic deployment on push
   - Copy the public URL

### Frontend Deployment to Vercel

1. **Set Environment Variables**
   
   In Vercel dashboard, add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**
   - Click "Add New" → "Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: frontend
     - **Build Command**: `npm run build`
     - **Output Directory**: dist

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

### Frontend Deployment to Netlify

1. **Set Environment Variables**
   
   In Netlify dashboard, add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up

3. **Deploy**
   - Drag and drop the `frontend/dist` folder
   - Or connect GitHub for auto-deploy

4. **Configure**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`

## 🔧 Production Checklist

### Backend
- [ ] Set production DATABASE_URL
- [ ] Update CORS origins to your frontend URL
- [ ] Set `reload=False` in production
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set up error logging
- [ ] Configure rate limiting

### Frontend
- [ ] Update API_BASE_URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Test all features
- [ ] Optimize images
- [ ] Enable HTTPS
- [ ] Set up analytics (optional)

### Database
- [ ] Backup strategy in place
- [ ] Connection pooling configured
- [ ] Indexes created for performance
- [ ] Regular maintenance scheduled

## 🔒 Security Hardening

### Backend Security
1. **Add CORS restrictions**
   ```python
   # In app/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-url.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Add rate limiting**
   ```bash
   pip install slowapi
   ```

3. **Use HTTPS only**
   - Most platforms provide free SSL

### Frontend Security
1. **Environment variables**
   - Never commit API keys
   - Use `.env.local` for secrets

2. **Content Security Policy**
   - Add CSP headers in deployment platform

## 📊 Monitoring

### Backend Monitoring
- Use Render/Railway built-in logs
- Set up error tracking (Sentry)
- Monitor database performance

### Frontend Monitoring
- Vercel Analytics (built-in)
- Google Analytics (optional)
- Error tracking (Sentry)

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Render auto-deploys on push

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Vercel auto-deploys on push
```

## 💰 Cost Estimate

### Free Tier (Recommended for MVP)
- **Neon Database**: Free (0.5GB storage)
- **Render Backend**: Free (750 hours/month)
- **Vercel Frontend**: Free (unlimited)
- **Total**: $0/month

### Paid Tier (For Growth)
- **Neon Database**: $19/month (Pro)
- **Render Backend**: $7/month (Starter)
- **Vercel Frontend**: $20/month (Pro)
- **Total**: ~$46/month

## 🆘 Troubleshooting Deployment

### Backend Issues

**Build fails:**
- Check Python version (3.9+)
- Verify all dependencies in requirements.txt
- Check build logs

**Database connection fails:**
- Verify DATABASE_URL format
- Check Neon database is active
- Ensure SSL mode is enabled

**CORS errors:**
- Update allowed origins in main.py
- Include frontend URL

### Frontend Issues

**Build fails:**
- Check Node version (18+)
- Clear cache: `npm cache clean --force`
- Delete node_modules and reinstall

**API calls fail:**
- Verify API_BASE_URL is correct
- Check backend is running
- Check CORS configuration

**404 on refresh:**
- Add `_redirects` file for Netlify:
  ```
  /*    /index.html   200
  ```
- Vercel handles this automatically

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Add Custom Domain to Render
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS records

## 🔐 Environment Variables Reference

### Required Backend Variables
```env
DATABASE_URL=postgresql://...
BUSINESS_NAME=Your Business Name
BUSINESS_ADDRESS=Your Address
BUSINESS_GSTIN=Your GSTIN
BUSINESS_PHONE=Your Phone
BUSINESS_BANK_NAME=Bank Name
BUSINESS_ACCOUNT_NUMBER=Account Number
BUSINESS_IFSC=IFSC Code
BUSINESS_BRANCH=Branch Name
```

### Optional Variables
```env
SENTRY_DSN=https://...  # Error tracking
LOG_LEVEL=INFO
MAX_CONNECTIONS=20
```

## ✅ Post-Deployment Testing

1. **Test all features:**
   - [ ] Create customer
   - [ ] Create product
   - [ ] Create bill
   - [ ] View invoice
   - [ ] Print invoice
   - [ ] Export to Excel

2. **Performance testing:**
   - [ ] Page load times
   - [ ] API response times
   - [ ] Database query performance

3. **Mobile testing:**
   - [ ] Responsive design
   - [ ] Touch interactions
   - [ ] Print functionality

## 🎉 Go Live Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] All features tested
- [ ] Business details updated
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Team trained on system

---

**Need Help?** Check the main README.md or create an issue on GitHub.
