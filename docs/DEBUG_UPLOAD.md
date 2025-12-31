# Debugging Image Upload Issues

## Problem: Upload Spins Forever, No Backend Logs

If you press upload and it just spins with no backend logs, the request isn't reaching the backend.

## Quick Fixes:

### 1. Check API URL Configuration

The mobile app needs to use your computer's IP address, NOT `localhost`.

**Your computer's IP:** `192.168.1.172`

**Check your `.env` file in `packages/mobile/`:**

```bash
cd packages/mobile
cat .env
```

**It should have:**
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.172:3000/api/v1
```

**NOT:**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1  # ❌ Won't work from phone!
```

### 2. Verify Backend is Running

```bash
cd packages/backend
npm run dev
```

You should see:
```
🚀 Goguma backend server started
    port: 3000
```

### 3. Test Backend Connectivity

From your phone's browser (or using curl on your computer):
```
http://192.168.1.172:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### 4. Check Mobile App Console

When you press upload, check the Expo console. You should see:
```
Uploading images to: http://192.168.1.172:3000/api/v1/items/...
Image count: 1
Upload progress: X%
```

### 5. Check Backend Logs

When upload is pressed, backend should immediately log:
```
Image upload request received
```

If you don't see this, the request isn't reaching the backend.

## Common Issues:

1. **Wrong API URL** - Using `localhost` instead of IP address
2. **Backend not running** - Check if `npm run dev` is running
3. **Firewall blocking** - Port 3000 might be blocked
4. **Network issue** - Phone and computer not on same WiFi network
5. **CORS issue** - Backend CORS not configured for mobile IP

## Files Should Go To:

**Supabase Storage:**
- Bucket: `item-images`
- Path: `{userId}/{itemId}/original_{imageId}.jpg`

**View in Supabase Dashboard:**
1. Go to **Storage** → **item-images**
2. Navigate to your `userId` folder
3. Then `itemId` folder
4. You should see `original_{imageId}.jpg` files

## Next Steps:

1. **Verify `.env` has correct API URL** (your computer IP, not localhost)
2. **Restart Expo** after changing `.env`:
   ```bash
   cd packages/mobile
   npx expo start --clear
   ```
3. **Check mobile console** for upload progress logs
4. **Check backend terminal** for request logs
5. **Try uploading again**

If still no backend logs, the request isn't reaching the server - check network/firewall.

