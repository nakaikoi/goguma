# Goguma

**AI-powered photo-to-eBay listing application**

Goguma enables users to take photos of an item and automatically generate a structured, editable eBay listing draft using computer vision, AI, and eBay APIs.

## 🎯 Goal

Reduce the friction of selling items online by turning photos into high-quality eBay listings in under 60 seconds.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- eBay Developer account

### Setup

1. Clone the repository:
```bash
git clone git@github.com:nakaikoi/goguma.git
cd goguma
```

2. Install dependencies (from root):
```bash
npm install
```
This installs dependencies for all packages in the monorepo.

3. Set up environment variables (see `.env.example` in each package)

4. Start development:
```bash
# From root - run backend
npm run dev:backend

# From root - run mobile app
npm run dev:mobile

# Or run from individual packages:
cd packages/backend && npm run dev
cd packages/mobile && npm start
```

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

- [Product Specification](./docs/product-specification.md) - Complete product requirements
- [Development Gameplan](./docs/DEVELOPMENT_GAMEPLAN.md) - Step-by-step development plan
- [API Design](./docs/API_DESIGN.md) - API endpoints and schemas (coming soon)

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

Currently in **Phase 0: Project Setup & Foundation**

See [DEVELOPMENT_GAMEPLAN.md](./docs/DEVELOPMENT_GAMEPLAN.md) for detailed progress.

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

