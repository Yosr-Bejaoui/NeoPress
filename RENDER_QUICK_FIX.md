# Quick Render Configuration

## Settings in Render Dashboard

### Root Directory
```
(leave empty)
```

### Build Command
```bash
cd client && npm install && npm run build && cd ../server && npm install
```

### Start Command
```bash
npm start
```

### Environment Variables (Required)
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MONGODB_URI` = your MongoDB connection string
- `JWT_SECRET` = any random secret string
- `GEMINI_API_KEY` = your Gemini API key
- `NEWSAPI_API_KEY` = your NewsAPI key

## After Configuring

1. Click "Manual Deploy"
2. Select "Clear build cache & deploy"
3. Wait for deployment to complete (check logs)
4. Visit your URL - should see the app!

## Troubleshooting

### If build fails:
- Check that all dependencies are in client/package.json
- Make sure Node version is 18+
- Look at build logs for specific errors

### If "Frontend not built" error:
- Build command didn't complete successfully
- Check build logs
- Make sure client/build directory was created

### If 404 on /api/auth/login:
- Backend is running but endpoints not registered
- Check server logs for "Registered API routes"
- Make sure server/index.js is running
