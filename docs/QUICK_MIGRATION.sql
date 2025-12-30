-- ============================================
-- Goguma Database Migration
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Run it section by section, or all at once

-- ============================================
-- Migration 1: Create Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('draft', 'processing', 'ready', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('image_upload', 'ai_analysis', 'ebay_draft', 'pricing_lookup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_item_images_item_id ON item_images(item_id);
CREATE INDEX IF NOT EXISTS idx_item_images_order ON item_images(item_id, order_index);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_item_id ON listing_drafts(item_id);
CREATE INDEX IF NOT EXISTS idx_jobs_item_id ON jobs(item_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_pending ON jobs(status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ebay_accounts_user_id ON ebay_accounts(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_drafts_updated_at ON listing_drafts;
CREATE TRIGGER update_listing_drafts_updated_at BEFORE UPDATE ON listing_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ebay_accounts_updated_at ON ebay_accounts;
CREATE TRIGGER update_ebay_accounts_updated_at BEFORE UPDATE ON ebay_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration 2: Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Users can create own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;
DROP POLICY IF EXISTS "Users can view own item images" ON item_images;
DROP POLICY IF EXISTS "Users can create own item images" ON item_images;
DROP POLICY IF EXISTS "Users can delete own item images" ON item_images;
DROP POLICY IF EXISTS "Users can view own listing drafts" ON listing_drafts;
DROP POLICY IF EXISTS "Users can create own listing drafts" ON listing_drafts;
DROP POLICY IF EXISTS "Users can update own listing drafts" ON listing_drafts;
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can create own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view own eBay account" ON ebay_accounts;
DROP POLICY IF EXISTS "Users can create own eBay account" ON ebay_accounts;
DROP POLICY IF EXISTS "Users can update own eBay account" ON ebay_accounts;
DROP POLICY IF EXISTS "Users can delete own eBay account" ON ebay_accounts;

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

-- ============================================
-- Migration 3: Storage Bucket & Policies
-- ============================================

-- Create storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload to own directory" ON storage.objects;
DROP POLICY IF EXISTS "Users can read from own directory" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from own directory" ON storage.objects;

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

-- ============================================
-- Done! All migrations complete.
-- ============================================

