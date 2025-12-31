# OpenAI Setup Guide

OpenAI is required for the AI analysis feature that generates eBay listing drafts from photos.

## Why You Need OpenAI

The "Analyze Item" feature uses **OpenAI GPT-4o** (with vision capabilities) to:
- Analyze product photos
- Generate listing titles
- Write descriptions
- Extract item specifics (brand, model, size, color, etc.)
- Assess condition and visible flaws
- Suggest pricing
- Generate keywords

**Without OpenAI API key, the analyze feature won't work!**

---

## Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform:**
   - Visit [platform.openai.com](https://platform.openai.com)
   - Sign up or log in

2. **Create API Key:**
   - Click on your profile (top right)
   - Go to **"API keys"**
   - Click **"Create new secret key"**
   - Give it a name (e.g., "Goguma Development")
   - Click **"Create secret key"**
   - **Copy the key immediately** - you won't see it again!
   - Format: `sk-proj-...` or `sk-...`

3. **Add Credits (if needed):**
   - Go to **"Billing"** → **"Add payment method**
   - Add a payment method
   - Set up usage limits if desired
   - GPT-4o costs ~$0.01-0.05 per analysis (depends on image count)

---

## Step 2: Add API Key to Backend

1. **Open backend `.env` file:**
   ```bash
   cd packages/backend
   nano .env
   # or use your preferred editor
   ```

2. **Find or add this line:**
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Replace with your actual key:**
   ```bash
   OPENAI_API_KEY=sk-proj-abc123xyz789...
   ```

4. **Save the file**

---

## Step 3: Verify Setup

1. **Restart backend** (if it's running):
   - Stop the backend (Ctrl+C)
   - Start it again: `npm run dev`

2. **Check backend logs:**
   - You should see: `🚀 Goguma backend server started`
   - No errors about missing API key

3. **Test AI analysis:**
   - Upload images in the mobile app
   - Tap "Analyze Item"
   - Should work without errors!

---

## Cost Estimate

**GPT-4o Pricing (as of 2024):**
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens
- Images: ~$0.01 per image

**Per Analysis:**
- ~$0.01-0.05 per listing analysis
- Depends on number of images and response length

**Tips to save money:**
- Set usage limits in OpenAI dashboard
- Monitor usage regularly
- Use for testing, not production spam

---

## Troubleshooting

### "OPENAI_API_KEY is not set"
- Check `.env` file exists in `packages/backend/`
- Verify key starts with `sk-`
- Make sure no extra spaces or quotes
- Restart backend after adding key

### "Insufficient quota" or "Rate limit exceeded"
- Check OpenAI dashboard for usage limits
- Verify payment method is added
- Check account has credits
- Wait a few minutes and try again

### "Invalid API key"
- Verify key is correct (copy-paste again)
- Check key hasn't been revoked
- Make sure you're using the right key type

### AI analysis takes too long
- Normal: 10-30 seconds per analysis
- Depends on number of images
- Check backend logs for errors
- Verify internet connection

---

## Alternative: Use Claude (Anthropic)

If you prefer Claude instead of OpenAI:

1. Get Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Update code to use Claude instead of OpenAI (requires code changes)

**Note:** Current implementation uses OpenAI. Claude support would need to be added.

---

## Security Reminders

- ⚠️ **Never commit `.env` files** to git
- ⚠️ **Never share your API key** publicly
- ⚠️ **Rotate keys** if exposed
- ⚠️ **Set usage limits** to prevent unexpected charges
- ⚠️ **Monitor usage** regularly in OpenAI dashboard

---

## Next Steps

Once OpenAI is configured:
1. ✅ Backend can analyze images
2. ✅ "Analyze Item" button will work
3. ✅ AI-generated drafts will be created
4. ✅ All data saved to database

**Ready to test?** Upload some images and tap "Analyze Item"!

