# Getting Started with Goguma

This guide will walk you through setting up and running the Goguma application.

## Prerequisites

- **Node.js 20+** - [Installation guide](./INSTALL_NODE.md)
- **npm** (comes with Node.js)
- **Supabase account** (free tier works)
- **OpenAI API key** (for AI analysis)
- **Expo Go app** on your phone (iOS/Android)

---

## Step 1: Clone and Install

```bash
# Clone the repository (if you haven't already)
git clone git@github.com:nakaikoi/goguma.git
cd goguma

# Install dependencies for all packages
npm install
```

---

## Step 2: Set Up Supabase

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run database migrations:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the SQL from `docs/QUICK_MIGRATION.sql`
   - Run the migration
   - This creates all tables, indexes, and RLS policies

3. **Create storage bucket:**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `item-images`
   - Set it to **Public** (or configure RLS policies)
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for details

4. **Configure redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URL: `goguma://auth/callback`
   - See [MOBILE_AUTH_SETUP.md](./MOBILE_AUTH_SETUP.md) for details

---

## Step 3: Configure Backend

1. **Create backend `.env` file:**
   ```bash
   cd packages/backend
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Server
   PORT=3000
   NODE_ENV=development
   API_PREFIX=/api/v1
   CORS_ORIGIN=*

   # AI (OpenAI)
   OPENAI_API_KEY=sk-your-openai-api-key

   # eBay (optional for now)
   EBAY_APP_ID=your-ebay-app-id
   EBAY_DEV_ID=your-ebay-dev-id
   EBAY_CERT_ID=your-ebay-cert-id
   ```

3. **Get your computer's IP address:**
   ```bash
   hostname -I | awk '{print $1}'
   ```
   You'll need this for the mobile app to connect to the backend.

---

## Step 4: Configure Mobile App

1. **Create mobile `.env` file:**
   ```bash
   cd packages/mobile
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   # Supabase (same as backend)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Backend API (use your computer's IP, not localhost)
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api/v1
   # Example: EXPO_PUBLIC_API_URL=http://192.168.1.172:3000/api/v1
   ```

---

## Step 5: Start the Backend

```bash
cd packages/backend
npm run dev
```

You should see:
```
🚀 Goguma backend server started
    port: 3000
    env: "development"
    apiPrefix: "/api/v1"
```

**Keep this terminal running!**

---

## Step 6: Start the Mobile App

In a **new terminal**:

```bash
cd packages/mobile
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open Expo DevTools in your browser

---

## Step 7: Run on Your Phone

1. **Install Expo Go:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the app:**
   - **iOS:** Open Camera app and scan the QR code
   - **Android:** Open Expo Go app and scan the QR code
   - Or use the Expo Go app's "Scan QR Code" feature

3. **Make sure your phone and computer are on the same WiFi network!**

---

## Step 8: Test the App

1. **Sign in:**
   - Enter your email
   - Check your email for the magic link
   - Click the link (it will open in Expo Go)

2. **Create a listing:**
   - Tap the "+" button
   - Take or select photos
   - Tap "Upload Images"
   - Wait for upload to complete (progress bar)

3. **Analyze the item:**
   - Navigate to Draft screen (auto-navigates after upload)
   - Tap "Analyze Item"
   - Wait for AI analysis (10-30 seconds)
   - View the generated draft!

---

## Troubleshooting

### Backend won't start
- Check that Node.js version is 20+: `node --version`
- Verify `.env` file exists and has all required variables
- Check Supabase connection: `npm run test-env` (in backend folder)

### Mobile app can't connect
- Verify `EXPO_PUBLIC_API_URL` uses your computer's IP (not localhost)
- Make sure backend is running on port 3000
- Check that phone and computer are on same WiFi
- Try accessing `http://YOUR_IP:3000/health` from phone browser

### Images won't upload
- Check backend logs for errors
- Verify Supabase Storage bucket `item-images` exists
- Check that images are being saved to storage

### AI analysis fails
- Verify `OPENAI_API_KEY` is set in backend `.env`
- Check OpenAI API key is valid and has credits
- Check backend logs for detailed error messages

### Magic link doesn't work
- Verify redirect URL is set in Supabase: `goguma://auth/callback`
- Check mobile app logs for deep link errors
- See [MOBILE_AUTH_SETUP.md](./MOBILE_AUTH_SETUP.md) for details

---

## Next Steps

- **View your listings:** Home screen shows all your items
- **Edit drafts:** Tap on a listing to view/edit the draft
- **Delete items:** Swipe or tap delete button on listings
- **Delete images:** Tap × button on images in draft view

---

## Documentation

- [Product Specification](./product-specification.md) - Full product vision
- [API Design](./API_DESIGN.md) - All API endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - All env vars explained
- [Supabase Setup](./SUPABASE_SETUP.md) - Detailed Supabase configuration
- [Mobile Auth Setup](./MOBILE_AUTH_SETUP.md) - Authentication configuration
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and fixes

---

## Development Commands

### Backend
```bash
cd packages/backend
npm run dev          # Start development server
npm run test-env     # Test environment variables
```

### Mobile
```bash
cd packages/mobile
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
```

### Root
```bash
npm install          # Install all dependencies
```

---

## Need Help?

- Check the [Troubleshooting](./TROUBLESHOOTING.md) guide
- Review backend logs for error messages
- Check mobile app console (Expo DevTools)
- Verify all environment variables are set correctly

---

**You're all set! Happy listing! 🎉**

