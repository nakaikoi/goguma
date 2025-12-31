# Goguma

**AI-powered photo-to-eBay listing application**

Goguma enables users to take photos of an item and automatically generate a structured, editable eBay listing draft using computer vision, AI, and eBay APIs.

## 🎯 Goal

Reduce the friction of selling items online by turning photos into high-quality eBay listings in under 60 seconds.

## 🚀 Quick Start

**👉 See [GETTING_STARTED.md](./docs/GETTING_STARTED.md) for complete setup instructions!**

### Quick Overview

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create project at [supabase.com](https://supabase.com)
   - Run migrations from `docs/QUICK_MIGRATION.sql`
   - Create `item-images` storage bucket

3. **Configure environment:**
   - Backend: `packages/backend/.env` (see `.env.example`)
   - Mobile: `packages/mobile/.env` (see `.env.example`)

4. **Start services:**
   ```bash
   # Terminal 1: Backend
   cd packages/backend && npm run dev
   
   # Terminal 2: Mobile
   cd packages/mobile && npm start
   ```

5. **Run on phone:**
   - Install Expo Go app
   - Scan QR code from mobile terminal
   - Make sure phone and computer are on same WiFi!

**For detailed instructions, see [GETTING_STARTED.md](./docs/GETTING_STARTED.md)**

## 📁 Project Structure

This is a **monorepo** containing all packages in a single repository:

```
goguma/
├── docs/                    # Documentation
│   ├── product-specification.md
│   ├── DEVELOPMENT_GAMEPLAN.md
│   └── API_DESIGN.md
├── packages/
│   ├── mobile/              # React Native Expo app (@goguma/mobile)
│   ├── backend/             # Node.js API server (@goguma/backend)
│   └── shared/              # Shared schemas and types (@goguma/shared)
├── package.json             # Root workspace configuration
├── README.md
└── .gitignore
```

**Why a monorepo?**
- Shared code between mobile and backend (Zod schemas, types)
- Easier coordination of changes across packages
- Single source of truth for the entire project
- Simplified dependency management

## 📚 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** ⭐ - Complete setup guide
- [Product Specification](./docs/product-specification.md) - Complete product requirements
- [Development Gameplan](./docs/DEVELOPMENT_GAMEPLAN.md) - Step-by-step development plan
- [API Design](./docs/API_DESIGN.md) - API endpoints and schemas
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Complete database design
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - Supabase configuration guide
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Configuration reference
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and fixes

## 🛠 Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + TypeScript (Fastify)
- **Database & Auth:** Supabase
- **AI:** OpenAI GPT-4 Vision or Claude Vision
- **Image Processing:** Sharp

## 🎯 MVP Features

- ✅ Photo capture (3-6 photos)
- ✅ AI-generated listing draft
- ✅ Manual review and editing
- ✅ eBay OAuth connection
- ✅ Draft eBay listing creation

## 📝 Development Status

Currently in **Phase 3 & 6 Complete** - AI Integration & Mobile App Foundation

**Progress:** ~60% Complete

**Completed:**
- ✅ Phase 0: Project Setup & Foundation
- ✅ Phase 1: Architecture & Schemas
- ✅ Phase 2.1-2.3: Backend Foundation (API, images, drafts)
- ✅ Phase 3: AI Integration (OpenAI GPT-4o)
- ✅ Phase 6: Mobile App Foundation (4 screens, auth, upload, drafts)

**Next:** Phase 5 (eBay Integration) to complete MVP

See [PROGRESS_REVIEW.md](./docs/PROGRESS_REVIEW.md) for detailed progress.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a PR

## 📄 License

[To be determined]

---

**Built with ❤️ for sellers**

