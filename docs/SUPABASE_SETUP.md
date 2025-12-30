# Supabase Setup Guide

This guide will walk you through setting up your Supabase project for Goguma.

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** `goguma` (or your preferred name)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")
   - **service_role key** (under "Project API keys" → "service_role" - **Keep this secret!**)

Copy these values - you'll need them for your `.env` file.

## Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `docs/DATABASE_SCHEMA.md` in this project
3. Copy the SQL from **Migration 1: Create Tables** (starts with `CREATE EXTENSION...`)
4. Paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

7. Now copy the SQL from **Migration 2: Row Level Security**
8. Paste and run it
9. You should see multiple "Success" messages

## Step 4: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Fill in:
   - **Name:** `item-images`
   - **Public bucket:** Unchecked (private)
   - **File size limit:** 50 MB (or your preference)
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp`
4. Click "Create bucket"

5. Now go to **SQL Editor** again
6. Copy the SQL from **Storage Policies** section in `docs/DATABASE_SCHEMA.md`
7. Paste and run it
8. You should see "Success" messages

## Step 5: Create Environment File

1. In `packages/backend/`, create a `.env` file:
```bash
cd packages/backend
touch .env
```

2. Add your credentials (see `docs/ENVIRONMENT_VARIABLES.md` for full list):
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# CORS Configuration
CORS_ORIGIN=http://localhost:8081,http://localhost:19006

# Logging
LOG_LEVEL=info
```

3. Replace the placeholder values with your actual Supabase credentials

## Step 6: Verify Setup

1. Install dependencies (if not done):
```bash
cd /home/book/Projects/goguma
npm install
```

2. Start the backend server:
```bash
npm run dev:backend
```

3. You should see:
```
🚀 Goguma backend server started
```

4. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

You should get:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Troubleshooting

### "Invalid environment variables" error
- Check that all required variables are in `.env`
- Make sure `SUPABASE_URL` starts with `https://`
- Verify keys are correct (no extra spaces)

### "Failed to connect to database"
- Check your Supabase project is active
- Verify `SUPABASE_URL` and keys are correct
- Check your network connection

### "Table does not exist"
- Make sure you ran all migrations
- Check SQL Editor for any errors
- Verify tables exist in **Table Editor** in Supabase dashboard

### Storage upload fails
- Verify `item-images` bucket exists
- Check storage policies were created
- Verify bucket is not public (should be private)

## Next Steps

Once Supabase is set up:
1. ✅ Backend can connect to database
2. ✅ API endpoints will work
3. ✅ You can test creating items via API
4. Ready for Phase 2.2 (Image Processing)

## Security Reminders

- ⚠️ **Never commit `.env` files** (they're in `.gitignore`)
- ⚠️ **Never share your service_role key** publicly
- ⚠️ **Use different projects** for development and production
- ⚠️ **Rotate keys** if they're ever exposed

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or review `docs/DATABASE_SCHEMA.md` for schema details.

