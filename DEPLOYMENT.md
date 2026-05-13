# Monad Tracker - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Set Environment Variable** (Optional - for production):
```bash
vercel env add CMC_API_KEY
```
Then paste your CoinMarketCap API key: `12426ee8471941898435fd3d7ffc11b9`

5. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variable (optional):
   - Key: `CMC_API_KEY`
   - Value: `12426ee8471941898435fd3d7ffc11b9`
6. Click "Deploy"

### Option 3: Deploy from Local Directory

1. Push your code to GitHub/GitLab
2. Connect repository to Vercel
3. Vercel will automatically deploy

## 📁 Project Structure for Vercel

```
mon_tracker/
├── api/
│   └── cmc.js              # Serverless function for CoinMarketCap API
├── Monad Brand and Media Kit/
│   └── ...                 # Brand assets
├── index.html              # Main dashboard
├── vercel.json             # Vercel configuration
├── package.json            # Project metadata
├── server.js               # Local development server (not used in Vercel)
└── DEPLOYMENT.md           # This file
```

## 🔧 How It Works

- **Local Development**: Use `node server.js` (runs on http://localhost:3000)
- **Vercel Production**: 
  - `index.html` is served as static file
  - `/api/cmc` endpoint is handled by `api/cmc.js` serverless function
  - Brand assets are served as static files

## 🌐 After Deployment

Your site will be available at:
- `https://your-project-name.vercel.app`
- Or your custom domain if configured

## ⚙️ Environment Variables (Optional)

For better security in production, set the API key as an environment variable:

1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add: `CMC_API_KEY` = `12426ee8471941898435fd3d7ffc11b9`
3. Redeploy the project

## 🔄 Auto-Deployment

Once connected to Git:
- Every push to `main` branch = automatic deployment
- Pull requests = preview deployments

## 📝 Notes

- The serverless function (`api/cmc.js`) handles CORS automatically
- Static files (HTML, images, SVGs) are served from the root
- No need to run `server.js` on Vercel - it's only for local development

## 🐛 Troubleshooting

**Issue**: API not working
- **Solution**: Check environment variables in Vercel dashboard

**Issue**: Images not loading
- **Solution**: Ensure "Monad Brand and Media Kit" folder is included in deployment

**Issue**: 404 errors
- **Solution**: Check `vercel.json` routes configuration

## 📞 Support

For issues, check:
- Vercel deployment logs
- Browser console for errors
- Network tab for API calls