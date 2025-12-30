# Database Schema Design

This document defines the complete database schema for Goguma using Supabase (PostgreSQL).

## Overview

All tables use UUID primary keys and include `created_at` and `updated_at` timestamps. Row Level Security (RLS) is enabled on all tables.

---

## Tables

### 1. users

Extends Supabase's built-in `auth.users` table. Additional user metadata.

**Columns:**
- `id` (uuid, primary key) - References `auth.users.id`
- `email` (text, unique, not null)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**RLS Policies:**
- Users can only read/update their own record

---

### 2. items

Represents an item being listed. Tracks the item through the listing process.

**Columns:**
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, foreign key → users.id, not null)
- `status` (text, enum: 'draft', 'processing', 'ready', 'published', not null, default 'draft')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes:**
- `idx_items_user_id` on `user_id`
- `idx_items_status` on `status`

**RLS Policies:**
- Users can only access their own items

---

### 3. item_images

Stores references to images uploaded for an item.

**Columns:**
- `id` (uuid, primary key, default gen_random_uuid())
- `item_id` (uuid, foreign key → items.id, not null, on delete cascade)
- `storage_path` (text, not null) - Path in Supabase Storage
- `order_index` (integer, not null, default 0) - For ordering images
- `created_at` (timestamptz, default now())

**Indexes:**
- `idx_item_images_item_id` on `item_id`
- `idx_item_images_order` on `(item_id, order_index)`

**RLS Policies:**
- Users can only access images for their own items

---

### 4. listing_drafts

Stores the AI-generated or user-edited listing draft.

**Columns:**
- `id` (uuid, primary key, default gen_random_uuid())
- `item_id` (uuid, foreign key → items.id, not null, unique, on delete cascade)
- `title` (text, not null)
- `description` (text, not null)
- `condition` (text, not null) - eBay condition
- `item_specifics` (jsonb, not null) - Brand, model, size, color, etc.
- `suggested_price_min` (numeric(10, 2))
- `suggested_price_max` (numeric(10, 2))
- `suggested_price` (numeric(10, 2))
- `price_confidence` (numeric(3, 2)) - 0.00 to 1.00
- `category_id` (text) - eBay category ID
- `keywords` (text[]) - Array of keywords
- `ai_confidence` (numeric(3, 2)) - 0.00 to 1.00
- `visible_flaws` (text[]) - Array of flaw descriptions
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes:**
- `idx_listing_drafts_item_id` on `item_id`

**RLS Policies:**
- Users can only access drafts for their own items

---

### 5. jobs

Tracks background jobs (image upload, AI analysis, eBay draft creation).

**Columns:**
- `id` (uuid, primary key, default gen_random_uuid())
- `item_id` (uuid, foreign key → items.id, not null, on delete cascade)
- `type` (text, enum: 'image_upload', 'ai_analysis', 'ebay_draft', 'pricing_lookup', not null)
- `status` (text, enum: 'pending', 'processing', 'completed', 'failed', not null, default 'pending')
- `error_message` (text, nullable)
- `metadata` (jsonb) - Additional job data
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())
- `completed_at` (timestamptz, nullable)

**Indexes:**
- `idx_jobs_item_id` on `item_id`
- `idx_jobs_status` on `status`
- `idx_jobs_pending` on `(status, created_at)` where `status = 'pending'` - For efficient polling

**RLS Policies:**
- Users can only access jobs for their own items

---

### 6. ebay_accounts

Stores encrypted eBay OAuth tokens for users.

**Columns:**
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, foreign key → users.id, not null, unique)
- `access_token` (text, not null) - Encrypted
- `refresh_token` (text, not null) - Encrypted
- `token_expires_at` (timestamptz, not null)
- `ebay_user_id` (text, not null)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**Indexes:**
- `idx_ebay_accounts_user_id` on `user_id`

**RLS Policies:**
- Users can only access their own eBay account

**Security Notes:**
- Tokens must be encrypted at rest
- Use Supabase Vault or application-level encryption

---

## Supabase Storage Buckets

### `item-images`

Stores original and processed images.

**Structure:**
```
item-images/
  {user_id}/
    {item_id}/
      original_{image_id}.jpg
      compressed_{image_id}.jpg
      thumbnail_{image_id}.jpg
```

**Policies:**
- Users can upload to their own `{user_id}/` directory
- Users can read from their own `{user_id}/` directory
- Public read access for published listings (optional)

---

## SQL Migrations

### Migration 1: Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE item_status AS ENUM ('draft', 'processing', 'ready', 'published');
CREATE TYPE job_type AS ENUM ('image_upload', 'ai_analysis', 'ebay_draft', 'pricing_lookup');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status item_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item images table
CREATE TABLE IF NOT EXISTS item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing drafts table
CREATE TABLE IF NOT EXISTS listing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT NOT NULL,
  item_specifics JSONB NOT NULL,
  suggested_price_min NUMERIC(10, 2),
  suggested_price_max NUMERIC(10, 2),
  suggested_price NUMERIC(10, 2),
  price_confidence NUMERIC(3, 2),
  category_id TEXT,
  keywords TEXT[] DEFAULT '{}',
  ai_confidence NUMERIC(3, 2),
  visible_flaws TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- eBay accounts table
CREATE TABLE IF NOT EXISTS ebay_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  ebay_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_item_images_item_id ON item_images(item_id);
CREATE INDEX idx_item_images_order ON item_images(item_id, order_index);
CREATE INDEX idx_listing_drafts_item_id ON listing_drafts(item_id);
CREATE INDEX idx_jobs_item_id ON jobs(item_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_pending ON jobs(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_ebay_accounts_user_id ON ebay_accounts(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_drafts_updated_at BEFORE UPDATE ON listing_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebay_accounts_updated_at BEFORE UPDATE ON ebay_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration 2: Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_accounts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Item images policies
CREATE POLICY "Users can view own item images" ON item_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can create own item images" ON item_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own item images" ON item_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_images.item_id AND items.user_id = auth.uid())
  );

-- Listing drafts policies
CREATE POLICY "Users can view own listing drafts" ON listing_drafts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = listing_drafts.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can create own listing drafts" ON listing_drafts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM items WHERE items.id = listing_drafts.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can update own listing drafts" ON listing_drafts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = listing_drafts.item_id AND items.user_id = auth.uid())
  );

-- Jobs policies
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = jobs.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can create own jobs" ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM items WHERE items.id = jobs.item_id AND items.user_id = auth.uid())
  );

-- eBay accounts policies
CREATE POLICY "Users can view own eBay account" ON ebay_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own eBay account" ON ebay_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eBay account" ON ebay_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own eBay account" ON ebay_accounts
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Storage Policies

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', false);

-- Storage policies for item-images bucket
CREATE POLICY "Users can upload to own directory" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read from own directory" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'item-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete from own directory" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Notes

- All timestamps use `TIMESTAMPTZ` for timezone-aware storage
- Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- RLS policies ensure users can only access their own data
- Indexes are optimized for common query patterns
- Storage policies restrict access to user-specific directories

