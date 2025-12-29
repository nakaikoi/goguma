# Goguma

**AI-powered photo-to-eBay listing application**

Goguma enables users to take photos of an item and automatically generate a structured, editable eBay listing draft using computer vision, AI, and eBay APIs.

---

## 1. Product Vision

**Goal:**
Reduce the friction of selling items online by turning photos into high-quality eBay listings in under 60 seconds.

**Target Users:**
- Casual resellers
- Power sellers / flippers
- Internal use for high-volume sellers

**Core Value:**
- Less typing
- Faster listings
- Better titles, descriptions, and pricing suggestions

---

## 2. Core User Flow

1. User opens Goguma mobile app
2. Takes 3–6 photos of an item
3. Photos are uploaded in the background
4. AI analyzes photos and returns structured listing data
5. User reviews and edits listing draft
6. User connects eBay account (OAuth)
7. Goguma creates a draft eBay listing
8. User publishes on eBay (inside Goguma or eBay)

---

## 3. Functional Requirements

### 3.1 Photo Capture
- Multi-photo capture
- Automatic compression & orientation fix
- Optional barcode scanning

### 3.2 AI Listing Generation
From images, generate:
- Title
- Description (bullet points)
- Item specifics (brand, model, size, color, etc.)
- Condition + visible flaws
- Keywords
- Category suggestion
- Suggested price range

### 3.3 Listing Review & Editing
- Editable fields
- Validation before submission
- Save drafts

### 3.4 eBay Integration
- OAuth connection
- Create draft listings
- Store refresh tokens securely

---

## 4. Technical Architecture (High Level)

```
Mobile App
   ↓
Backend API (Node.js / TypeScript)
   ↓
Supabase (Auth, DB, Storage)
   ↓
AI Vision & Pricing Services
   ↓
eBay API
```

---

## 5. Frontend Stack

**Platform:**
- React Native (Expo)

**Key Libraries:**
- Expo Camera
- Expo Media Library
- Zod (shared schema validation)
- Zustand or React Query (state)

**Responsibilities:**
- Camera capture
- Draft review UI
- Auth & account linking
- Status updates for background jobs

---

## 6. Backend Stack

**Runtime:**
- Node.js
- TypeScript

**Framework:**
- Fastify or Next.js API routes

**Responsibilities:**
- Authentication enforcement
- Image processing
- Job orchestration
- AI calls
- eBay API integration

---

## 7. Supabase Usage

### 7.1 Auth
- Magic link or OAuth
- Row Level Security (RLS)

### 7.2 Database (Postgres)

**Tables:**
- users
- items
- item_images
- listing_drafts
- jobs
- ebay_accounts

### 7.3 Storage
- Original images
- Compressed images
- Thumbnails

---

## 8. AI & Vision Layer

### 8.1 Model Capabilities
- Image understanding
- Multimodal prompts
- JSON-only output

### 8.2 Schema Enforcement
- Zod schemas for:
  - ListingDraft
  - ItemSpecifics
  - PricingSuggestion

### 8.3 Prompt Strategy
- System prompt defines eBay seller context
- Output strictly validated before save

---

## 9. Pricing & Comps (Phase 2)

- Pull eBay sold listings
- Compute median + confidence range
- Show price confidence meter

---

## 10. Async Job System

**Why:**
- Image uploads
- AI analysis
- Pricing lookups
- eBay draft creation

**Implementation Options:**
- Supabase DB polling worker (MVP)
- BullMQ + Redis (scale)

---

## 11. Image Processing

- Sharp (Node)
- Resize & compress
- EXIF stripping
- Orientation correction

---

## 12. Security & Compliance

- Encrypted token storage
- Rate limiting on AI endpoints
- No permanent storage of sensitive metadata

---

## 13. Observability

- Structured logs (pino)
- Error tracking (Sentry)
- Job status visibility

---

## 14. MVP Scope

**Included:**
- Photo capture
- AI-generated listing draft
- Manual review
- Draft eBay listing creation

**Excluded (Phase 2+):**
- Auto-publishing
- Inventory sync
- Bulk listings
- Cross-marketplace support

---

## 15. Future Enhancements

- Amazon / Facebook Marketplace
- Voice input for condition notes
- Auto background removal
- Seller performance analytics
- Subscription tiers

---

## 16. Naming & Identity

**App Name:** Goguma

**Tone:**
- Friendly
- Fast
- Seller-first

---

## 17. Success Metrics

- Time-to-list < 60 seconds
- % of listings published
- Seller retention
- Average listing quality score

---

## 18. Development Phases

1. Architecture + schemas
2. Photo upload + AI pipeline
3. Draft editor UI
4. eBay OAuth + draft creation
5. Internal dogfooding

---

_End of document_

