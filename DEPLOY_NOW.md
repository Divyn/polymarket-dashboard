# 🚀 Deploy to Railway - Step by Step

## Quick Deployment Steps

### Step 1: Sign in to Railway
1. Go to **[railway.app](https://railway.app)**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with your **GitHub account** (same account as `buddies2705`)

### Step 2: Create New Project
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub repositories (if first time)
4. Find and select: **`buddies2705/polymarket-dashboard`**
5. Click **"Deploy Now"**

### Step 3: Add Environment Variable
1. Once the project is created, click on your service
2. Go to the **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   - **Name**: `BITQUERY_OAUTH_TOKEN`
   - **Value**: `your_actual_bitquery_token_here` (paste your token, no quotes)
5. Click **"Add"**

**⚠️ Important**: Replace `your_actual_bitquery_token_here` with your real Bitquery OAuth token!

### Step 4: Add Persistent Volume (for Database)
1. In your service, go to **"Settings"** tab
2. Scroll down to **"Volumes"** section
3. Click **"Add Volume"**
4. Configure:
   - **Name**: `data`
   - **Mount Path**: `/app/data`
   - **Size**: `1 GB` (or more if needed)
5. Click **"Add"**

### Step 5: Wait for Deployment
1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Build the application (`npm run build`)
   - Start the server (`npm start`)
2. Watch the **"Deployments"** tab for build progress
3. This takes 3-5 minutes

### Step 6: Get Your Live URL
1. Once deployment is complete, go to **"Settings"** → **"Networking"**
2. Railway provides a public URL like:
   - `https://polymarket-dashboard-production.up.railway.app`
3. Click the URL to open your live application!

## ✅ Verification Checklist

After deployment, verify:
- [ ] Build completed successfully (green checkmark)
- [ ] Environment variable `BITQUERY_OAUTH_TOKEN` is set
- [ ] Volume is mounted at `/app/data`
- [ ] Application URL is accessible
- [ ] Check logs for initialization messages:
  - `[Env] ✅ Found OAuth token...`
  - `[DB] ✅ Database initialized`
  - `[Polling] ✅ Initial sync complete`

## 🔍 Monitor Your Deployment

### View Logs
1. Go to your service → **"Deployments"** tab
2. Click on the latest deployment
3. View **"Build Logs"** and **"Deploy Logs"**

### Check Application Status
- **Logs**: Service → **"Logs"** tab (real-time)
- **Metrics**: Service → **"Metrics"** tab (CPU, Memory, Network)

## 🐛 Troubleshooting

### Build Fails
- Check build logs for errors
- Verify `package.json` is correct
- Ensure Node.js version is compatible (Railway auto-detects)

### Application Crashes
- Check deploy logs
- Verify `BITQUERY_OAUTH_TOKEN` is set correctly
- Check if volume is mounted properly

### No Data Showing
- Wait 5-10 minutes for initial sync
- Check logs for API errors
- Verify token is valid and has correct format

### Database Issues
- Ensure volume is mounted at `/app/data`
- Check volume size (may need to increase)
- Verify `DB_PATH` points to volume location

## 📝 Environment Variables Reference

| Variable | Required | Value |
|---------|----------|-------|
| `BITQUERY_OAUTH_TOKEN` | ✅ Yes | Your Bitquery OAuth token |
| `BITQUERY_ENDPOINT` | No | `https://streaming.bitquery.io/graphql` (default) |
| `PORT` | No | Auto-set by Railway |
| `DB_PATH` | No | `data/polymarket.db` (default) |

## 🎉 Success!

Once deployed, your application will:
- ✅ Automatically sync data from Bitquery
- ✅ Store data in persistent SQLite database
- ✅ Update every 1-15 minutes (depending on event type)
- ✅ Be accessible from anywhere via Railway URL

## 🔗 Useful Links

- **Railway Dashboard**: [railway.app](https://railway.app)
- **Your Repository**: [github.com/buddies2705/polymarket-dashboard](https://github.com/buddies2705/polymarket-dashboard)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)

---

**Need Help?** Check the logs in Railway dashboard or review `RAILWAY_DEPLOYMENT.md` for detailed troubleshooting.

