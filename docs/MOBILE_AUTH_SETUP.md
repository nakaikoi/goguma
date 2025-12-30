# Mobile Authentication Setup Guide

This guide explains how to configure Supabase authentication for the mobile app, specifically for magic link (OTP) authentication.

## The Problem

When you click a magic link, it redirects to `localhost:3000` which doesn't work on your phone. This happens because Supabase needs to be configured with the correct redirect URLs.

## Solution: Configure Supabase Redirect URLs

### Step 1: Find Your Expo Development URL

When you run `npx expo start`, you'll see a QR code and a URL like:
```
exp://192.168.1.172:8081
```

**Note down this URL** - you'll need it for the next step.

### Step 2: Configure Site URL in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. **Set the Site URL:**
   - For Expo Go development, use: `exp://192.168.1.172:8081` (replace with your IP)
   - Or leave it as your Supabase project URL: `https://your-project-id.supabase.co`
   - **Note:** The Site URL is used as a fallback, but individual redirect URLs take precedence

### Step 3: Add Redirect URLs in Supabase

Still in **Authentication** → **URL Configuration**, under **Redirect URLs**, add the following URLs (one per line):

```
exp://192.168.1.172:8081/--/auth/callback
goguma://auth/callback
```

**Important:** Replace `192.168.1.172` with your actual computer's IP address (the one shown in the Expo QR code).

### Step 4: Add Wildcard Pattern (Optional but Recommended)

For development, you can also add a wildcard pattern to allow any IP on your network:

```
exp://192.168.1.*:8081/--/auth/callback
```

This way, if your IP changes, you don't need to update Supabase every time.

### Step 5: Verify Configuration

1. Save the redirect URLs in Supabase
2. Restart your Expo server:
   ```bash
   cd packages/mobile
   npx expo start --clear
   ```
3. Try the magic link again

## How It Works

1. When you request a magic link, the app sends your email to Supabase
2. Supabase sends an email with a magic link
3. The link redirects to one of the configured URLs (e.g., `exp://192.168.1.172:8081/--/auth/callback`)
4. Expo Go opens the app with this deep link
5. The app extracts the authentication tokens from the URL
6. You're logged in!

## Troubleshooting

### Still redirecting to localhost:3000?

1. **Check Supabase Site URL:**
   - Go to Authentication → URL Configuration
   - Check the **Site URL** field at the top
   - If it's set to `http://localhost:3000`, change it to:
     - Your Expo URL: `exp://192.168.1.172:8081` (replace with your IP)
     - Or your Supabase project URL: `https://your-project-id.supabase.co`
   - **This is the most common cause!** The Site URL is used as a fallback

2. **Check Redirect URLs:**
   - Make sure your redirect URLs are saved (not just typed)
   - Check for typos in the URLs
   - Verify the IP address matches your Expo QR code

2. **Check the console:**
   - When you request a magic link, check the Expo console
   - You should see: `Using redirect URL: exp://...`
   - If you see a different URL, that's the issue

3. **Verify your IP address:**
   - Make sure the IP in the redirect URL matches the one in your Expo QR code
   - Your IP might have changed if you reconnected to WiFi

4. **Try the exact URL from console:**
   - Copy the exact URL shown in the console log
   - Add it to Supabase redirect URLs
   - Make sure there are no extra spaces or characters

### Deep link not opening the app?

1. Make sure Expo Go is installed on your phone
2. Make sure you're scanning the QR code with Expo Go (not your camera app)
3. Try manually opening the link: `exp://192.168.1.172:8081` (replace with your IP)

### Session not being set?

1. Check the app console logs
2. Look for "Deep link received:" messages
3. Check for any error messages about setting the session
4. Make sure the URL contains `#access_token=` or `?access_token=`

## Production Setup

For production builds (not Expo Go), you'll need to:

1. Use the `goguma://auth/callback` scheme
2. Configure this in your app's native configuration
3. Add it to Supabase redirect URLs
4. Test with a production build

## Additional Resources

- [Supabase Auth Deep Linking](https://supabase.com/docs/guides/auth/deep-linking)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Expo Auth Session](https://docs.expo.dev/guides/authentication/)

