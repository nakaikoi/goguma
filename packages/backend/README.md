# @goguma/backend

Node.js API server for Goguma.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Required environment variables:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
   - `PORT` - Server port (default: 3000)
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider API key
   - `ENCRYPTION_KEY` - 32-character key for encrypting eBay tokens

4. **Run development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

## Tech Stack

- **Framework:** Fastify (web framework)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL)
- **Logging:** Pino
- **Image Processing:** Sharp
- **AI:** OpenAI GPT-4 Vision or Anthropic Claude

## API Endpoints

See [API Design](../../docs/API_DESIGN.md) for complete endpoint documentation.

Base URL: `http://localhost:3000/api/v1`

## Development

- Hot reload enabled in development mode
- TypeScript compilation on the fly with `tsx`
- Structured logging with Pino
- Error handling middleware
