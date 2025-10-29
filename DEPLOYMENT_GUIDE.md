# NeoPress Deployment Guide

## 🚀 Vercel Frontend Deployment (Current Issue Fix)

### Problem
Getting `404: NOT_FOUND` error on Vercel because the project structure is a monorepo with separate `client/` and `server/` folders.

### Solution

#### Step 1: Configure Vercel Project Settings

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your NeoPress project
3. Click **Settings** → **General**
4. Update these settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |
| **Node Version** | `18.x` (or latest) |

5. Click **Save**

#### Step 2: Set Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:

```
Name: REACT_APP_API_URL
Value: https://your-backend-url.onrender.com/api
```

Replace `your-backend-url.onrender.com` with your actual Render backend URL.

3. Select environment: **Production**, **Preview**, and **Development**
4. Click **Save**

#### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **•••** menu on the latest deployment
3. Click **Redeploy**
4. Monitor the deployment logs

### Expected Deployment Logs

You should see:
```
✓ Installing dependencies
✓ Building application
✓ Build completed
✓ Deployment complete
```

### Verification

After successful deployment:
1. Visit your Vercel URL
2. Navigate to different routes (e.g., `/dashboard`, `/login`)
3. All routes should work without 404 errors

---

## 🖥️ Render Backend Deployment

### Configuration

Your backend is already deployed on Render. Make sure these settings are correct:

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Branch** | `main` |
| **Auto-Deploy** | `Yes` |

### Environment Variables (Already Set)

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `NEWSAPI_API_KEY`
- `NODE_ENV=production`

---

## 🔗 Connecting Frontend to Backend

### In Vercel Environment Variables:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### CORS Configuration

Your backend already has CORS configured in `server/middleware/security.js`. Make sure your Vercel URL is allowed.

---

## ✅ Post-Deployment Checklist

- [ ] Vercel Root Directory set to `client`
- [ ] Build command is `npm run build`
- [ ] Output directory is `build`
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] Redeployed after configuration changes
- [ ] All routes working (no 404 errors)
- [ ] API calls reaching backend successfully
- [ ] CORS configured properly
- [ ] Render backend auto-deploys on push

---

## 🐛 Troubleshooting

### Still Getting 404?

1. Check Vercel deployment logs for build errors
2. Verify `client/vercel.json` exists in your repo
3. Confirm Root Directory is set to `client` (not empty or `/`)
4. Make sure you redeployed after changing settings

### API Calls Failing?

1. Check browser console for CORS errors
2. Verify `REACT_APP_API_URL` is set correctly
3. Test backend directly: `https://your-backend.onrender.com/health`
4. Check Render logs for backend errors

### Build Failing?

1. Check if all dependencies are in `client/package.json`
2. Verify Node version compatibility
3. Look for syntax errors in deployment logs
4. Test build locally: `cd client && npm run build`

---

## 📝 Quick Commands

### Test Build Locally
```bash
cd client
npm install
npm run build
```

### Test Backend Locally
```bash
cd server
npm install
npm start
```

### Push Changes
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🎯 Summary

**The main issue:** Vercel was trying to build from the repository root instead of the `client/` directory.

**The fix:** Set Root Directory to `client` in Vercel project settings.

After applying these fixes, your app should work perfectly! 🚀
