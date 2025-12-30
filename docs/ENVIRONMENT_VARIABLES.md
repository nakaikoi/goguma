# Environment Variables Reference

This document describes all environment variables required for the Goguma project.

## Backend Environment Variables

Create a `.env` file in `packages/backend/` with the following variables:

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:8081,http://localhost:19006

# Logging
LOG_LEVEL=info
```

### Optional Variables

```bash
# AI Provider (choose at least one)
OPENAI_API_KEY=your-openai-api-key
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key

# eBay API Configuration (for Phase 5)
EBAY_APP_ID=your-ebay-app-id
EBAY_CERT_ID=your-ebay-cert-id
EBAY_DEV_ID=your-ebay-dev-id
EBAY_RU_NAME=your-ebay-ru-name
EBAY_REDIRECT_URI=http://localhost:3000/api/v1/auth/ebay/callback

# Encryption Key for eBay Tokens (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Variable Descriptions

### Supabase
- `SUPABASE_URL` - Your Supabase project URL (found in project settings)
- `SUPABASE_ANON_KEY` - Public anon key (for client-side operations, respects RLS)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations, bypasses RLS) - **Keep this secret!**

### Server
- `PORT` - Port the server listens on (default: 3000)
- `NODE_ENV` - Environment mode: `development`, `production`, or `test`
- `API_PREFIX` - API route prefix (default: `/api/v1`)

### CORS
- `CORS_ORIGIN` - Allowed origins (comma-separated). Use `*` for all origins (not recommended for production)

### AI Provider
- `OPENAI_API_KEY` - OpenAI API key (for GPT-4 Vision)
- `ANTHROPIC_API_KEY` - Anthropic API key (for Claude Vision)
- At least one AI provider key is required

### eBay (Phase 5)
- `EBAY_APP_ID` - eBay application ID
- `EBAY_CERT_ID` - eBay certificate ID
- `EBAY_DEV_ID` - eBay developer ID
- `EBAY_RU_NAME` - eBay RU name (RuName)
- `EBAY_REDIRECT_URI` - OAuth redirect URI

### Security
- `ENCRYPTION_KEY` - 32+ character key for encrypting eBay tokens (generate with `openssl rand -base64 32`)

### Logging
- `LOG_LEVEL` - Log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace` (default: `info`)

## Getting Started

1. Copy the required variables to `packages/backend/.env`
2. Fill in your actual values
3. Never commit `.env` files to git (they're in `.gitignore`)

## Security Notes

- Never commit `.env` files or expose service role keys
- Use different keys for development and production
- Rotate keys regularly
- Keep encryption keys secure

