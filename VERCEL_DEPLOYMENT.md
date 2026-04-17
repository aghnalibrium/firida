# FIRIDA - Vercel Deployment Guide

## Prerequisites
- ✅ Vercel CLI installed
- ⚠️ Vercel account (create at https://vercel.com)
- ⚠️ Git repository committed (✅ DONE)

---

## Step-by-Step Deployment

### Step 1: Login to Vercel

**Run this command in your terminal:**
```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to login/signup to Vercel
3. Authorize the CLI

---

### Step 2: Initial Deployment (Without Database)

**Navigate to project directory:**
```bash
cd /Users/cokrodarsono/Documents/FIRIDA/firida
```

**Deploy to Vercel:**
```bash
vercel
```

**When prompted:**
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No**
- What's your project's name? **firida** (or your preferred name)
- In which directory is your code located? **./** (press Enter)
- Want to modify settings? **No**

**Expected result:**
- Deployment will start
- ⚠️ It will FAIL because database is not configured yet
- This is NORMAL! We need to add Postgres database first

---

### Step 3: Add Vercel Postgres Database

**Go to Vercel Dashboard:**
1. Open https://vercel.com/dashboard
2. Find your `firida` project
3. Click on the project
4. Go to **Storage** tab
5. Click **Create Database**
6. Select **Postgres**
7. Database name: `firida-db`
8. Region: **Singapore (sin1)** (closest to your location)
9. Click **Create**

**Connect Database to Project:**
1. After creation, click **Connect to Project**
2. Select your `firida` project
3. Environment: **Production** (check all: Production, Preview, Development)
4. Click **Connect**

This will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- etc.

---

### Step 4: Update Environment Variables

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. The Postgres variables should already be there
3. You can verify `POSTGRES_PRISMA_URL` exists

**Update Prisma Schema:**

We need to update the schema to use the Vercel Postgres URL.

Edit `prisma/schema.prisma` and change:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("POSTGRES_PRISMA_URL")  // Use Vercel's variable
}
```

**Update .env for local development:**
Keep your local `.env` with SQLite for development:
```env
# Local development uses SQLite
DATABASE_URL="file:./dev.db"

# Production will use Vercel's POSTGRES_PRISMA_URL
```

---

### Step 5: Update Prisma Schema for PostgreSQL

Run these commands locally:

```bash
# Update schema to PostgreSQL
# Edit prisma/schema.prisma datasource to postgresql

# Generate new migration for PostgreSQL
npx prisma migrate dev --name switch_to_postgres
```

**Note:** This creates a new migration. We'll apply it on Vercel in the next step.

---

### Step 6: Redeploy to Vercel

**Commit schema changes:**
```bash
git add .
git commit -m "Update Prisma schema for PostgreSQL"
```

**Deploy again:**
```bash
vercel --prod
```

This time it should succeed because:
- ✅ Database environment variables are set
- ✅ Prisma schema uses PostgreSQL
- ✅ Build script includes `prisma generate`

---

### Step 7: Run Database Migrations on Vercel

**You have 2 options:**

#### Option A: Using Vercel CLI (Recommended)
```bash
# This runs migration on production database
vercel env pull .env.production
DATABASE_URL=$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

#### Option B: Add to package.json
Add a migration script and run it after deployment:

In `package.json`:
```json
"scripts": {
  "migrate:deploy": "prisma migrate deploy"
}
```

Then in Vercel dashboard:
1. Settings → General → Build & Development Settings
2. Add install command: `npm install && npm run migrate:deploy`

---

### Step 8: Seed Initial Data (Admin User)

**Create seed data on production:**

Run this command to seed the production database:
```bash
vercel env pull .env.production
DATABASE_URL=$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2-) npx prisma db seed
```

This creates the admin user:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

### Step 9: Verify Deployment

**Your app should now be live!**

1. Vercel will give you a URL like: `https://firida.vercel.app`
2. Open the URL in your browser
3. You should see the FIRIDA login page
4. Login with `admin` / `admin123`
5. Change the password immediately!

**Test checklist:**
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create daily income
- [ ] Can view reports
- [ ] Export to Excel works
- [ ] Export to PDF works

---

## Troubleshooting

### Build Fails
**Error:** `Prisma Client not found`
**Solution:** Make sure `postinstall` script exists in package.json

### Database Connection Error
**Error:** `Can't reach database server`
**Solution:**
1. Check environment variables in Vercel dashboard
2. Make sure `POSTGRES_PRISMA_URL` is set
3. Verify database is in same region as deployment

### Migration Fails
**Error:** `Migration failed to apply`
**Solution:**
1. Reset database (if no production data yet)
2. Run `prisma migrate reset` locally
3. Redeploy to Vercel

---

## Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Project:** https://vercel.com/[username]/firida
- **Storage (Database):** https://vercel.com/[username]/firida/storage
- **Logs:** https://vercel.com/[username]/firida/logs

---

## Post-Deployment Security

1. **Change Admin Password** ⚠️ CRITICAL
2. **Enable 2FA on Vercel account**
3. **Review environment variables** (make sure no secrets are exposed)
4. **Setup monitoring** (Vercel Analytics included)
5. **Configure custom domain** (optional)

---

## Ongoing Maintenance

### Deploy New Changes
```bash
git add .
git commit -m "Your changes"
git push
vercel --prod
```

### View Logs
```bash
vercel logs firida --prod
```

### Rollback to Previous Deployment
In Vercel Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

---

## Cost Estimate

**Vercel Pricing (as of 2026):**
- Hobby (Free):
  - Good for testing
  - Limited bandwidth and build minutes

- Pro ($20/month):
  - Recommended for production
  - More bandwidth and builds
  - Better support

**Postgres Database:**
- Included in Vercel Pro plan
- Or use external PostgreSQL (Railway, Supabase, etc.)

---

**Good luck with your deployment! 🚀**

For issues, check Vercel documentation: https://vercel.com/docs
