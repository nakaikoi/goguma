# Quick Start Checklist

Use this checklist to verify your setup step by step.

## ✅ Prerequisites Check

- [x] Node.js 20+ installed (You have: v20.19.6)
- [x] Backend .env file exists
- [x] Mobile .env file exists
- [x] Dependencies installed
- [x] Supabase URL configured
- [x] OpenAI API key configured
- [x] Mobile API URL configured (192.168.1.172:3000)

## 📋 Setup Steps

### Step 1: Verify Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor**
4. Check if these tables exist:
   - [ ] `users`
   - [ ] `items`
   - [ ] `item_images`
   - [ ] `listing_drafts`
   - [ ] `jobs`
   - [ ] `ebay_accounts`

**If tables are missing:**
- Go to **SQL Editor**
- Copy SQL from `docs/QUICK_MIGRATION.sql`
- Paste and run it

### Step 2: Verify Supabase Storage

1. In Supabase dashboard, go to **Storage**
2. Check if bucket exists:
   - [ ] `item-images` bucket exists

**If bucket is missing:**
- Click "Create a new bucket"
- Name: `item-images`
- Public: **Unchecked** (private)
- Click "Create bucket"

### Step 3: Verify Authentication Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, check:
   - [ ] `goguma://auth/callback` is listed
   - [ ] `exp://192.168.1.*:8081` is listed (optional, for Expo Go)

**If missing:**
- Add `goguma://auth/callback`
- Click "Save"

### Step 4: Test Backend Connection

Run this command:
```bash
cd packages/backend
npm run test-env
```

Expected output:
- ✅ Supabase connection successful
- ✅ All environment variables valid

### Step 5: Start Backend Server

```bash
cd packages/backend
npm run dev
```

Expected output:
```
🚀 Goguma backend server started
    port: 3000
    env: "development"
    apiPrefix: "/api/v1"
```

**Keep this terminal running!**

### Step 6: Test Backend Health

In a new terminal:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Step 7: Start Mobile App

In a new terminal:
```bash
cd packages/mobile
npm start
```

Expected:
- Expo DevTools opens in browser
- QR code appears in terminal
- Server running on port 8081

### Step 8: Connect Phone

1. **Install Expo Go** (if not installed):
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect:**
   - **iOS:** Open Camera app → Scan QR code
   - **Android:** Open Expo Go app → Scan QR code

3. **Important:** Make sure phone and computer are on the **same WiFi network!**

### Step 9: Test the App

1. **Sign in:**
   - Enter your email
   - Check email for magic link
   - Click link (opens in Expo Go)

2. **Create listing:**
   - Tap "+" button
   - Take/select photos
   - Tap "Upload Images"
   - Watch progress bar

3. **Analyze:**
   - Auto-navigates to Draft screen
   - Tap "Analyze Item"
   - Wait 10-30 seconds
   - View AI-generated draft!

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file has all required variables
- Run `npm run test-env` to verify

### Mobile can't connect
- Verify API URL uses your IP (192.168.1.172), not localhost
- Check backend is running
- Verify same WiFi network

### Images won't upload
- Check Supabase Storage bucket exists
- Check backend logs for errors

### AI analysis fails
- Verify OpenAI API key is valid
- Check API key has credits
- Check backend logs

---

**Ready to start? Let's begin with Step 1!**

