# Troubleshooting Guide

## Backend 500 Errors

### Issue: 500 error when creating items

**Cause:** The backend was using the regular Supabase client (anon key) which respects RLS policies, but without a user JWT token in the client context, RLS blocks database operations.

**Solution:** The backend now uses `supabaseAdmin` (service role key) which bypasses RLS. This is safe because:
- User authentication is still verified via the auth middleware
- The backend validates `userId` in all operations
- RLS policies are enforced at the application level

**To apply the fix:**

1. **Stop the backend server** (if running):
   - Find the process: `ps aux | grep "tsx watch"`
   - Kill it: `kill <PID>` or press `Ctrl+C` in the terminal

2. **Restart the backend:**
   ```bash
   cd packages/backend
   npm run dev
   ```

3. **Verify it's working:**
   - You should see: `🚀 Goguma backend server started`
   - Check logs for any errors

4. **Test from mobile app:**
   - Try creating an item again
   - Should work now!

## Common Issues

### Backend not picking up code changes

**Solution:** Restart the backend server. The `tsx watch` command should auto-reload, but sometimes a manual restart is needed.

### SecureStore warnings about size > 2048 bytes

**Status:** This is expected and handled gracefully. Supabase session data can be large, but it still works. The warning can be ignored.

### OTP expired errors

**Solution:** Request a new magic link. OTP links expire after a certain time (usually 1 hour).

### Deep link not opening app

**Check:**
1. Supabase redirect URLs are configured correctly
2. Site URL is set (not localhost:3000)
3. Expo Go is installed on your phone
4. You're scanning the QR code with Expo Go (not camera app)

## Debugging Tips

### Check backend logs

The backend logs all errors. Look for:
- Database connection errors
- RLS policy violations
- Missing environment variables
- Authentication failures

### Check mobile app logs

In Expo, you can see console logs. Look for:
- API request/response details
- Authentication errors
- Network errors

### Test backend directly

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with auth (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/v1/items
```

## Still Having Issues?

1. **Check environment variables:**
   ```bash
   cd packages/backend
   ./scripts/validate-env.sh
   ```

2. **Verify Supabase connection:**
   ```bash
   cd packages/backend
   npx tsx src/test-env.ts
   ```

3. **Check database migrations:**
   - Make sure all migrations are run in Supabase SQL Editor
   - Verify tables exist in Supabase dashboard

4. **Review error logs:**
   - Backend: Check terminal where `npm run dev` is running
   - Mobile: Check Expo console/logs

