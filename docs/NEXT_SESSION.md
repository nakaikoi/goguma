# Next Session: eBay Integration

**Date:** Ready to start  
**Goal:** Complete Phase 5 - eBay Integration to finish MVP

---

## 🎯 What We've Accomplished

### ✅ Complete & Working
- **Backend API** - 13 endpoints fully functional
- **Mobile App** - 4 screens with full UX
- **AI Integration** - OpenAI GPT-4o generating listing drafts
- **Image Upload** - Async processing with progress tracking
- **Authentication** - Magic link auth working
- **Database** - All tables and relationships set up

### 📊 Current Status
- **Progress:** ~60% complete
- **MVP Status:** Core flow working (Photos → AI → Draft)
- **Missing:** eBay integration (final step)

---

## 🚀 Next Steps: eBay Integration (Phase 5)

### Step 1: eBay Developer Account Setup
1. **Create eBay Developer Account**
   - Go to: https://developer.ebay.com/
   - Sign up for developer account
   - Create a new application
   - Get **App ID (Client ID)** and **Client Secret**
   - Set redirect URI: `http://localhost:3000/api/v1/auth/ebay/callback`

2. **Choose eBay API**
   - **Sell API** - For creating listings
   - **Browse API** - For category lookup (optional)
   - **OAuth API** - For authentication

3. **Environment Variables**
   Add to `packages/backend/.env`:
   ```env
   EBAY_APP_ID=your-app-id
   EBAY_CLIENT_SECRET=your-client-secret
   EBAY_REDIRECT_URI=http://localhost:3000/api/v1/auth/ebay/callback
   EBAY_ENVIRONMENT=sandbox  # or 'production'
   ```

### Step 2: eBay OAuth Implementation
**Files to create/modify:**
- `packages/backend/src/services/ebay/oauth.ts` - OAuth flow
- `packages/backend/src/services/ebay/api-client.ts` - eBay API client
- `packages/backend/src/routes/ebay.ts` - eBay routes
- `packages/backend/src/services/db/ebay-accounts.ts` - Store tokens

**Endpoints needed:**
- `GET /api/v1/auth/ebay/connect` - Initiate OAuth
- `GET /api/v1/auth/ebay/callback` - Handle OAuth callback
- `GET /api/v1/auth/ebay/status` - Check connection status
- `DELETE /api/v1/auth/ebay/disconnect` - Disconnect account

### Step 3: eBay Listing Creation
**Files to create/modify:**
- `packages/backend/src/services/ebay/listing.ts` - Create listings
- `packages/backend/src/routes/listings.ts` - Listing routes

**Endpoints needed:**
- `POST /api/v1/items/:id/create-ebay-draft` - Create draft on eBay
- `POST /api/v1/items/:id/publish-ebay` - Publish listing
- `GET /api/v1/items/:id/ebay-status` - Check listing status

### Step 4: Mobile App Updates
**Files to modify:**
- `packages/mobile/src/screens/DraftScreen.tsx` - Add "Connect eBay" and "Publish" buttons
- `packages/mobile/src/services/api.ts` - Add eBay API methods
- `packages/mobile/src/store/items-store.ts` - Add eBay actions

**Features to add:**
- Connect eBay account button
- Publish to eBay button
- eBay connection status indicator

---

## 📚 Resources

### eBay API Documentation
- **Sell API:** https://developer.ebay.com/api-docs/sell/account/overview.html
- **OAuth:** https://developer.ebay.com/api-docs/static/oauth-consent-scopes.html
- **Create Listing:** https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem

### Key eBay Concepts
- **OAuth 2.0** - For user authentication
- **Inventory API** - For creating draft listings
- **Fulfillment API** - For publishing listings
- **Sandbox vs Production** - Start with sandbox for testing

### Required eBay Scopes
- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Create listings
- `https://api.ebay.com/oauth/api_scope/sell.marketing.readonly` - Read marketing info
- `https://api.ebay.com/oauth/api_scope/sell.account.readonly` - Read account info

---

## 🔧 Technical Implementation Notes

### OAuth Flow
1. User clicks "Connect eBay" in mobile app
2. Backend generates OAuth URL with redirect
3. User authorizes in browser
4. eBay redirects to callback URL with code
5. Backend exchanges code for access token
6. Store encrypted tokens in database
7. Use tokens for API calls

### Token Storage
- Store in `ebay_accounts` table
- Encrypt tokens before storing
- Refresh tokens when expired
- Handle token refresh automatically

### Listing Creation Flow
1. Get draft from database
2. Map draft fields to eBay format
3. Create inventory item (draft)
4. Create offer (publish)
5. Update item status to "published"

### Error Handling
- Handle OAuth errors
- Handle API rate limits
- Handle invalid listings
- Provide user-friendly error messages

---

## 📝 Checklist for Next Session

### Setup
- [ ] Create eBay developer account
- [ ] Create eBay application
- [ ] Get App ID and Client Secret
- [ ] Add environment variables
- [ ] Test OAuth flow in sandbox

### Backend Implementation
- [ ] Install eBay SDK or use REST API
- [ ] Implement OAuth service
- [ ] Implement eBay API client
- [ ] Create eBay routes
- [ ] Implement token storage/encryption
- [ ] Implement listing creation
- [ ] Add error handling

### Mobile App Updates
- [ ] Add eBay connection UI
- [ ] Add publish button
- [ ] Add connection status
- [ ] Handle OAuth redirect
- [ ] Test full flow

### Testing
- [ ] Test OAuth flow
- [ ] Test draft creation
- [ ] Test listing publication
- [ ] Test error cases
- [ ] Test on mobile device

---

## 🎯 Success Criteria

**MVP Complete When:**
- ✅ User can connect eBay account
- ✅ User can create draft listing on eBay
- ✅ User can publish listing to eBay
- ✅ Listing appears on eBay (sandbox or production)
- ✅ Error handling works correctly

---

## 💡 Tips

1. **Start with Sandbox** - Test everything in eBay sandbox first
2. **Use eBay SDK** - Consider using official eBay SDK if available
3. **Handle Rate Limits** - eBay has rate limits, implement retry logic
4. **Test Categories** - eBay categories are complex, test thoroughly
5. **User Feedback** - Show clear status messages during OAuth and publishing

---

## 📖 Related Documentation

- [API Design](./API_DESIGN.md) - See eBay endpoints section
- [Database Schema](./DATABASE_SCHEMA.md) - See `ebay_accounts` table
- [Development Gameplan](./DEVELOPMENT_GAMEPLAN.md) - Phase 5 details

---

**Ready to build! 🚀**

