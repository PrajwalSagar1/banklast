# 🚀 Deployment Guide for MyBank

This guide covers deploying MyBank to production using popular platforms.

---

## 📋 Pre-Deployment Checklist

- [ ] All code is pushed to GitHub
- [ ] `.env` files created with production values
- [ ] Database (MongoDB) set up in production
- [ ] Frontend and backend built successfully locally
- [ ] All environment variables documented

---

## 🔐 Production Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mybank
JWT_SECRET=your_secure_random_secret_key_min_32_chars
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-api.com
```

---

## 📦 Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository

### Step 3: Configure Service

```
Name: mybank-api
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 4: Add Environment Variables

In Render dashboard, add:

- `NODE_ENV` = production
- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = strong random key
- `FRONTEND_URL` = your frontend URL

### Step 5: Deploy

Click "Create Web Service" and Render will auto-deploy!

**Backend URL:** `https://mybank-api.onrender.com`

---

## 🎨 Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project

1. Click "Add New"
2. Select "Project"
3. Select your GitHub repository

### Step 3: Configure Build

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

### Step 4: Add Environment Variables

```
VITE_API_URL=https://your-backend-api.onrender.com
```

### Step 5: Deploy

Click "Deploy" and Vercel will handle the rest!

**Frontend URL:** `https://mybank.vercel.app`

---

## 🎨 Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: New Site from Git

1. Click "Add new site"
2. Select "Import an existing project"
3. Connect GitHub and select repository

### Step 3: Configure Build

```
Build Command: npm run build
Publish Directory: dist
```

### Step 4: Set Environment Variables

1. Go to Site settings → Environment
2. Add:
   - `VITE_API_URL` = your backend URL

### Step 5: Deploy

Netlify will automatically deploy when you push to GitHub!

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Account

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for free

### Step 2: Create Cluster

1. Click "Create a Deployment"
2. Choose "M0 Free Tier"
3. Select region closest to you
4. Click "Create"

### Step 3: Get Connection String

1. Go to Clusters → Connect
2. Click "Drivers"
3. Copy the connection string
4. Replace `<password>` with your password

### Step 4: IP Whitelist

1. Go to Security → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0) for development
4. For production, add your server's IP

### Step 5: Create Database User

1. Go to Security → Database Access
2. Click "Add New Database User"
3. Create username and password
4. Use these in MONGO_URI

---

## 🔄 GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }} -X POST
```

---

## ✅ Post-Deployment Testing

After deployment, test:

### API Health Check

```bash
curl https://your-api.com/api/health
```

### Frontend Accessibility

1. Visit your frontend URL
2. Test login/register
3. Test transactions
4. Check Console for errors

### Database Connection

1. Check backend logs
2. Verify MongoDB operations
3. Check API responses

---

## 🐛 Troubleshooting

### CORS Errors

```javascript
// Error: Access to XMLHttpRequest blocked
// Solution: Update FRONTEND_URL in backend .env
```

### API Connection Error

```javascript
// Error: Cannot connect to backend
// Solution: Update VITE_API_URL in frontend .env
// Check if backend is running and accessible
```

### Database Connection Failed

```javascript
// Error: MongoDB connection error
// Solution:
// 1. Verify MONGO_URI is correct
// 2. Check IP whitelist in MongoDB Atlas
// 3. Verify username/password
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Production Performance Tips

1. **Enable compression** - Already handled by Render/Vercel
2. **Minimize bundle size** - Vite optimizes automatically
3. **Use CDN** - Vercel/Netlify include CDN
4. **Database indexing** - Add indexes to MongoDB collections
5. **API caching** - Consider adding Redis for caching
6. **Error monitoring** - Use Sentry for error tracking
7. **Logging** - Use Winston for structured logging

---

## 🔒 Security Considerations

✅ Use HTTPS (handled by Render/Vercel)
✅ Environment variables for secrets
✅ CORS properly configured
✅ JWT token validation
✅ Password hashing (bcryptjs)
✅ Input validation
✅ Rate limiting (consider implementing)
✅ SQL injection prevention (using Mongoose)

---

## 🆘 Getting Help

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **MongoDB Docs:** https://docs.mongodb.com
- **Express Docs:** https://expressjs.com
- **React Docs:** https://react.dev

---

## 📝 Deployment Summary

| Service       | Backend | Frontend | Database |
| ------------- | ------- | -------- | -------- |
| Render        | ✅      | -        | -        |
| Vercel        | -       | ✅       | -        |
| Netlify       | -       | ✅       | -        |
| MongoDB Atlas | -       | -        | ✅       |

**Recommended Stack:**

- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas
