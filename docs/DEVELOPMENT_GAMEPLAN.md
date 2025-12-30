# Goguma Development Gameplan

**Last Updated:** 2024

This document outlines the step-by-step development plan for building Goguma, an AI-powered photo-to-eBay listing application.

---

## Overview

**Goal:** Build an MVP that can take photos, generate eBay listing drafts using AI, and create draft listings on eBay.

**Timeline:** Phased approach with MVP focus

**Tech Stack:**
- Frontend: React Native (Expo)
- Backend: Node.js + TypeScript (Fastify)
- Database & Auth: Supabase
- AI: OpenAI GPT-4 Vision or Claude Vision
- Image Processing: Sharp
- Job Queue: Supabase DB polling (MVP) → BullMQ (scale)

---

## Phase 0: Project Setup & Foundation

### 0.1 Repository Structure
```
goguma/
├── docs/
│   ├── product-specification.md
│   ├── DEVELOPMENT_GAMEPLAN.md
│   └── API_DESIGN.md
├── packages/
│   ├── mobile/          # React Native Expo app
│   ├── backend/         # Node.js API server
│   └── shared/          # Shared Zod schemas, types
├── .gitignore
├── README.md
└── package.json         # Root workspace (optional monorepo)
```

### 0.2 Development Environment
- [ ] Set up Node.js 20+ and npm/yarn/pnpm
- [ ] Install Expo CLI globally
- [ ] Create Supabase project
- [ ] Set up environment variable templates
- [ ] Configure git hooks (pre-commit, etc.)

### 0.3 Documentation
- [ ] API design document
- [ ] Database schema design
- [ ] Environment variables reference
- [ ] Contributing guidelines

---

## Phase 1: Architecture & Schemas

### 1.1 Database Schema Design
**Tables to create in Supabase:**

1. **users** (extends Supabase auth.users)
   - id (uuid, primary key)
   - email
   - created_at
   - updated_at

2. **items**
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - status (enum: 'draft', 'processing', 'ready', 'published')
   - created_at
   - updated_at

3. **item_images**
   - id (uuid, primary key)
   - item_id (uuid, foreign key)
   - storage_path (text)
   - order_index (integer)
   - created_at

4. **listing_drafts**
   - id (uuid, primary key)
   - item_id (uuid, foreign key)
   - title (text)
   - description (text)
   - condition (text)
   - item_specifics (jsonb)
   - suggested_price_min (numeric)
   - suggested_price_max (numeric)
   - category_id (text, nullable)
   - keywords (text[])
   - ai_confidence (numeric, 0-1)
   - created_at
   - updated_at

5. **jobs**
   - id (uuid, primary key)
   - item_id (uuid, foreign key)
   - type (enum: 'image_upload', 'ai_analysis', 'ebay_draft')
   - status (enum: 'pending', 'processing', 'completed', 'failed')
   - error_message (text, nullable)
   - metadata (jsonb)
   - created_at
   - updated_at
   - completed_at (timestamp, nullable)

6. **ebay_accounts**
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - access_token (text, encrypted)
   - refresh_token (text, encrypted)
   - token_expires_at (timestamp)
   - ebay_user_id (text)
   - created_at
   - updated_at

**Actions:**
- [ ] Design full schema with relationships
- [ ] Create migration files
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create indexes for performance

### 1.2 Shared Zod Schemas
**Create in `packages/shared/`:**
- [ ] `ListingDraft` schema
- [ ] `ItemSpecifics` schema
- [ ] `PricingSuggestion` schema
- [ ] `JobStatus` schema
- [ ] Export all schemas for use in frontend/backend

### 1.3 API Design
**Endpoints to design:**
- [ ] `POST /api/items` - Create new item
- [ ] `POST /api/items/:id/images` - Upload images
- [ ] `POST /api/items/:id/analyze` - Trigger AI analysis
- [ ] `GET /api/items/:id/draft` - Get listing draft
- [ ] `PUT /api/items/:id/draft` - Update listing draft
- [ ] `POST /api/items/:id/create-ebay-draft` - Create eBay draft
- [ ] `GET /api/jobs/:id` - Get job status
- [ ] `POST /api/auth/ebay/connect` - Initiate eBay OAuth
- [ ] `GET /api/auth/ebay/callback` - Handle eBay OAuth callback

**Actions:**
- [ ] Document all endpoints with request/response schemas
- [ ] Define error response format
- [ ] Plan authentication middleware

---

## Phase 2: Backend Foundation

### 2.1 Backend Project Setup
- [x] Initialize Node.js project with TypeScript
- [x] Set up Fastify framework
- [x] Configure environment variables (dotenv)
- [x] Set up Supabase client
- [x] Configure CORS for mobile app
- [x] Set up structured logging (pino)
- [x] Add error handling middleware

### 2.2 Image Processing Service
- [x] Install Sharp
- [x] Create image processing utilities:
  - [x] Resize to max dimensions
  - [x] Compress JPEG/PNG
  - [x] Strip EXIF data
  - [x] Fix orientation
- [x] Create upload service for Supabase Storage
- [x] Generate thumbnails

### 2.3 Database Layer
- [x] Set up Supabase client
- [x] Create database service layer
- [x] Implement CRUD operations for items table
- [x] Implement CRUD operations for item_images table
- [ ] Implement CRUD operations for listing_drafts table
- [ ] Implement CRUD operations for jobs table
- [ ] Implement CRUD operations for ebay_accounts table
- [ ] Add transaction support where needed

### 2.4 Authentication Middleware
- [x] Verify Supabase JWT tokens
- [x] Extract user ID from token
- [x] Create auth middleware for protected routes
- [x] Test with sample requests

---

## Phase 3: AI Integration

### 3.1 AI Service Setup
- [ ] Choose AI provider (OpenAI GPT-4 Vision or Claude)
- [ ] Set up API client
- [ ] Create prompt templates
- [ ] Design system prompts for eBay context

### 3.2 AI Analysis Service
- [ ] Create function to analyze images
- [ ] Implement structured JSON output parsing
- [ ] Validate output against Zod schemas
- [ ] Handle retries and errors
- [ ] Add confidence scoring

### 3.3 Prompt Engineering
- [ ] Write system prompt for eBay seller context
- [ ] Design prompts for:
  - [ ] Title generation
  - [ ] Description generation
  - [ ] Item specifics extraction
  - [ ] Condition assessment
  - [ ] Category suggestion
- [ ] Test and iterate on prompts

---

## Phase 4: Job System (MVP)

### 4.1 Simple Job Queue
- [ ] Create job table (already in schema)
- [ ] Implement job creation service
- [ ] Create worker that polls for pending jobs
- [ ] Implement job status updates
- [ ] Add error handling and retry logic

### 4.2 Job Types
- [ ] Image upload job
- [ ] AI analysis job
- [ ] eBay draft creation job

### 4.3 Background Worker
- [ ] Set up worker process (can run in same server for MVP)
- [ ] Poll jobs table every 5-10 seconds
- [ ] Process jobs sequentially or with concurrency limit
- [ ] Update job status appropriately

---

## Phase 5: eBay Integration

### 5.1 eBay API Setup
- [ ] Create eBay Developer account
- [ ] Register application
- [ ] Get API keys (App ID, Cert ID, Dev ID)
- [ ] Set up OAuth redirect URLs

### 5.2 OAuth Flow
- [ ] Implement OAuth initiation endpoint
- [ ] Handle OAuth callback
- [ ] Exchange code for tokens
- [ ] Store tokens securely (encrypted)
- [ ] Implement token refresh logic

### 5.3 eBay API Client
- [ ] Install eBay SDK or create HTTP client
- [ ] Implement token refresh
- [ ] Create draft listing function
- [ ] Map our listing draft to eBay format
- [ ] Handle eBay API errors

### 5.4 Security
- [ ] Encrypt tokens at rest
- [ ] Use environment variables for secrets
- [ ] Implement token rotation

---

## Phase 6: Mobile App Foundation

### 6.1 Expo Project Setup
- [ ] Initialize Expo project
- [ ] Set up TypeScript
- [ ] Configure app.json
- [ ] Set up navigation (React Navigation)
- [ ] Configure environment variables

### 6.2 Authentication Flow
- [ ] Set up Supabase client in app
- [ ] Create login/signup screens
- [ ] Implement magic link auth
- [ ] Store auth tokens securely
- [ ] Create auth context/provider

### 6.3 State Management
- [ ] Set up Zustand or React Query
- [ ] Create stores for:
  - [ ] Auth state
  - [ ] Items/drafts
  - [ ] Job status

### 6.4 API Client
- [ ] Create API client with authentication
- [ ] Set up request interceptors
- [ ] Handle errors gracefully
- [ ] Add retry logic

---

## Phase 7: Photo Capture

### 7.1 Camera Integration
- [ ] Install Expo Camera
- [ ] Create camera screen
- [ ] Implement multi-photo capture
- [ ] Add photo preview
- [ ] Allow photo deletion/reordering

### 7.2 Image Upload
- [ ] Compress images before upload
- [ ] Implement upload progress
- [ ] Create upload service
- [ ] Handle upload errors
- [ ] Show upload status

### 7.3 Image Management
- [ ] Display captured images
- [ ] Allow reordering
- [ ] Delete unwanted photos
- [ ] Show upload progress per image

---

## Phase 8: AI Analysis & Draft Generation

### 8.1 Trigger Analysis
- [ ] Create button to trigger AI analysis
- [ ] Show loading state
- [ ] Poll for job completion
- [ ] Handle errors

### 8.2 Display Draft
- [ ] Create draft review screen
- [ ] Display all generated fields:
  - [ ] Title
  - [ ] Description
  - [ ] Item specifics
  - [ ] Condition
  - [ ] Suggested price
  - [ ] Category
- [ ] Show AI confidence indicators

### 8.3 Draft Editing
- [ ] Make all fields editable
- [ ] Add validation
- [ ] Save draft to backend
- [ ] Auto-save functionality

---

## Phase 9: eBay Account Connection

### 9.1 OAuth Flow in App
- [ ] Create "Connect eBay" screen
- [ ] Open OAuth URL in browser/webview
- [ ] Handle OAuth callback
- [ ] Store connection status
- [ ] Show connection status in UI

### 9.2 Account Management
- [ ] Display connected eBay account
- [ ] Allow disconnection
- [ ] Show token expiration status
- [ ] Handle token refresh

---

## Phase 10: eBay Draft Creation

### 10.1 Create Draft Flow
- [ ] Add "Create eBay Draft" button
- [ ] Validate all required fields
- [ ] Show confirmation
- [ ] Trigger draft creation job
- [ ] Poll for completion

### 10.2 Draft Status
- [ ] Show draft creation progress
- [ ] Display success with eBay link
- [ ] Handle errors
- [ ] Allow retry

### 10.3 Navigation to eBay
- [ ] Open eBay draft in browser/app
- [ ] Provide instructions for publishing

---

## Phase 11: Polish & Testing

### 11.1 Error Handling
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add retry mechanisms
- [ ] Log errors properly

### 11.2 UI/UX Improvements
- [ ] Add loading states everywhere
- [ ] Improve empty states
- [ ] Add success animations
- [ ] Improve form validation feedback

### 11.3 Testing
- [ ] Test complete user flow
- [ ] Test error scenarios
- [ ] Test with various item types
- [ ] Performance testing
- [ ] Test on iOS and Android

### 11.4 Documentation
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add code comments
- [ ] Create user guide (if needed)

---

## Phase 12: Deployment Preparation

### 12.1 Backend Deployment
- [ ] Set up production environment
- [ ] Configure production Supabase
- [ ] Set up environment variables
- [ ] Deploy to hosting (Railway, Render, etc.)
- [ ] Set up domain and SSL

### 12.2 Mobile App
- [ ] Configure app for production
- [ ] Set up app icons and splash screens
- [ ] Build for iOS (TestFlight)
- [ ] Build for Android (internal testing)
- [ ] Submit to app stores (if public)

### 12.3 Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging aggregation
- [ ] Set up uptime monitoring
- [ ] Create dashboards

---

## Development Workflow

### Daily Workflow
1. Pull latest changes
2. Create feature branch
3. Work on task
4. Test locally
5. Commit with clear messages
6. Push and create PR (if team)
7. Merge after review

### Git Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

### Documentation Updates
- Update this gameplan as tasks are completed
- Document decisions in `/docs`
- Keep API docs up to date
- Update README as project evolves

---

## Next Steps

1. **Start with Phase 0** - Set up project structure
2. **Move to Phase 1** - Design schemas and APIs
3. **Build backend first** - Phases 2-5
4. **Then build mobile app** - Phases 6-10
5. **Polish and deploy** - Phases 11-12

---

## Notes

- MVP focuses on core flow: photos → AI → draft → eBay
- Can iterate on UI/UX after MVP works
- Job system can be simple for MVP, upgrade later
- Security is important from the start (encrypted tokens)
- Test with real items early and often

---

_This gameplan is a living document. Update as you progress and learn._

