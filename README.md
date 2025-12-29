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

2. Install dependencies (once packages are set up):
```bash
npm install
```

3. Set up environment variables (see `.env.example`)

4. Start development:
```bash
# Backend
cd packages/backend
npm run dev

# Mobile app
cd packages/mobile
npm start
```

## 📁 Project Structure

```
goguma/
├── docs/                    # Documentation
│   ├── product-specification.md
│   ├── DEVELOPMENT_GAMEPLAN.md
│   └── API_DESIGN.md
├── packages/
│   ├── mobile/              # React Native Expo app
│   ├── backend/             # Node.js API server
│   └── shared/              # Shared schemas and types
├── README.md
└── .gitignore
```

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

