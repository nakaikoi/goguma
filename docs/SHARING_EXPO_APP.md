# Sharing Your Expo App with Others

There are several ways to share your Goguma app with testers using Expo Go. Choose the method that works best for your situation.

## Method 1: Same Network (Easiest for Local Testing)

**Best for:** Testing with people on the same WiFi network (same office, home, etc.)

### Steps:

1. **Start the Expo dev server:**
   ```bash
   cd packages/mobile
   npm start
   ```

2. **Share the QR code:**
   - The QR code will appear in your terminal
   - The other person needs to:
     - Install **Expo Go** app on their phone (iOS or Android)
     - Open Expo Go app
     - Scan the QR code with their camera (iOS) or Expo Go app (Android)

3. **Share the connection URL:**
   - You'll see a URL like: `exp://192.168.1.172:8081`
   - Share this URL with them
   - They can enter it manually in Expo Go app

### Requirements:
- ✅ Both devices on same WiFi network
- ✅ Backend must be accessible (use your computer's IP address in `.env`)
- ✅ Firewall allows connections on port 8081

### Backend Configuration:
Make sure your mobile `.env` has the correct backend URL:
```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api/v1
```

To find your computer's IP:
- **Linux/Mac:** `ip addr show` or `ifconfig`
- **Windows:** `ipconfig`

---

## Method 2: Tunnel Mode (Works Across Networks)

**Best for:** Testing with people on different networks (remote testers)

### Steps:

1. **Start Expo with tunnel:**
   ```bash
   cd packages/mobile
   npx expo start --tunnel
   ```

2. **Share the connection:**
   - Expo will create a public URL (e.g., `exp://u.expo.dev/...`)
   - Share this URL or QR code with testers
   - They scan/enter it in Expo Go app

### Requirements:
- ✅ Expo account (free)
- ✅ Internet connection
- ⚠️ Slower than LAN mode (traffic goes through Expo's servers)
- ⚠️ Backend still needs to be accessible (consider using ngrok or similar)

### Backend Tunneling:
If using tunnel mode, you'll also need to tunnel your backend:

**Option A: Use ngrok (Recommended)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Share the ngrok URL (e.g., https://abc123.ngrok.io)
# Update mobile .env:
EXPO_PUBLIC_API_URL=https://abc123.ngrok.io/api/v1
```

**Option B: Use Cloudflare Tunnel**
```bash
# Install cloudflared
cloudflared tunnel --url http://localhost:3000
```

---

## Method 3: Expo Publish (Semi-Permanent Sharing)

**Best for:** Sharing a stable version that doesn't change frequently

### Steps:

1. **Login to Expo:**
   ```bash
   npx expo login
   ```

2. **Publish your app:**
   ```bash
   cd packages/mobile
   npx expo publish
   ```

3. **Share the published URL:**
   - Expo will give you a URL like: `exp://exp.host/@your-username/goguma`
   - Share this URL with testers
   - They can open it in Expo Go app

### Requirements:
- ✅ Expo account (free)
- ✅ App must be buildable (all dependencies compatible)
- ⚠️ Changes require republishing
- ⚠️ Backend still needs to be accessible

---

## Method 4: Development Build (Most Production-Like)

**Best for:** Testing with custom native code or production-like experience

### Steps:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS:**
   ```bash
   cd packages/mobile
   eas build:configure
   ```

3. **Build development version:**
   ```bash
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android
   ```

4. **Share the build:**
   - EAS will provide a download link
   - Testers install the build on their device
   - No Expo Go needed!

### Requirements:
- ✅ Expo account (free tier available)
- ✅ Apple Developer account (for iOS) - $99/year
- ✅ Google Play account (for Android) - $25 one-time
- ⚠️ Takes longer to build (10-20 minutes)

---

## Quick Reference: Which Method to Use?

| Method | Speed | Network | Setup Time | Best For |
|--------|-------|---------|------------|----------|
| Same Network | ⚡⚡⚡ Fast | Same WiFi | 1 min | Local testing |
| Tunnel | ⚡⚡ Medium | Any | 2 min | Remote testing |
| Publish | ⚡⚡ Medium | Any | 5 min | Stable versions |
| Dev Build | ⚡ Slow | Any | 20+ min | Production-like |

---

## Important Notes

### Backend Access
- **Local testing:** Use your computer's IP address
- **Remote testing:** Use ngrok, Cloudflare Tunnel, or deploy backend to a server
- **Production:** Deploy backend to a cloud service (Railway, Render, etc.)

### Environment Variables
Testers don't need to configure `.env` files - the app uses the values from your build/publish.

### Security
- Don't share sensitive API keys in published apps
- Use environment variables for configuration
- Consider using different Supabase projects for testing vs production

---

## Troubleshooting

### "Unable to connect to server"
- Check firewall settings
- Verify both devices on same network
- Try tunnel mode instead

### "Backend API errors"
- Verify backend is running
- Check `EXPO_PUBLIC_API_URL` is correct
- For remote testers, backend must be publicly accessible

### "Expo Go version mismatch"
- Update Expo Go app on tester's device
- Or update your project's Expo SDK version

---

## Example: Sharing with a Remote Tester

1. **Start backend:**
   ```bash
   cd packages/backend
   npm run dev
   ```

2. **Tunnel backend (ngrok):**
   ```bash
   ngrok http 3000
   # Copy the URL: https://abc123.ngrok.io
   ```

3. **Update mobile .env:**
   ```env
   EXPO_PUBLIC_API_URL=https://abc123.ngrok.io/api/v1
   ```

4. **Start Expo with tunnel:**
   ```bash
   cd packages/mobile
   npx expo start --tunnel
   ```

5. **Share:**
   - Send the Expo QR code/URL to tester
   - They scan it in Expo Go app
   - App connects to your backend via ngrok

---

**Need help?** Check Expo docs: https://docs.expo.dev/workflow/sharing/

