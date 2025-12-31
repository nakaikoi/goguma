/**
 * Database service for listing drafts
 */

import { supabaseAdmin } from '../../config/supabase.js';
import { logger } from '../../config/logger.js';
import { ListingDraft, type ItemSpecifics } from '@goguma/shared';

export interface ListingDraftRecord {
  id: string;
  item_id: string;
  title: string;
  description: string;
  condition: string;
  item_specifics: ItemSpecifics;
  suggested_price_min: number | null;
  suggested_price_max: number | null;
  suggested_price: number | null;
  price_confidence: number | null;
  category_id: string | null;
  keywords: string[];
  ai_confidence: number | null;
  visible_flaws: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Create listing draft
 */
export async function createListingDraft(
  itemId: string,
  draft: ListingDraft
): Promise<ListingDraftRecord> {
  const { data, error } = await supabaseAdmin
    .from('listing_drafts')
    .insert({
      item_id: itemId,
      title: draft.title,
      description: draft.description,
      condition: draft.condition,
      item_specifics: draft.itemSpecifics,
      suggested_price_min: draft.pricing.min,
      suggested_price_max: draft.pricing.max,
      suggested_price: draft.pricing.suggested,
      price_confidence: draft.pricing.confidence,
      category_id: draft.categoryId || null,
      keywords: draft.keywords,
      ai_confidence: draft.aiConfidence || null,
      visible_flaws: draft.visibleFlaws || [],
    })
    .select()
    .single();

  if (error) {
    logger.error({ error, itemId, draft }, 'Failed to create listing draft');
    throw new Error(`Failed to create listing draft: ${error.message}`);
  }

  return {
    id: data.id,
    item_id: data.item_id,
    title: data.title,
    description: data.description,
    condition: data.condition,
    item_specifics: data.item_specifics,
    suggested_price_min: data.suggested_price_min,
    suggested_price_max: data.suggested_price_max,
    suggested_price: data.suggested_price,
    price_confidence: data.price_confidence,
    category_id: data.category_id,
    keywords: data.keywords,
    ai_confidence: data.ai_confidence,
    visible_flaws: data.visible_flaws,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Get listing draft for item
 */
export async function getListingDraft(
  itemId: string,
  userId: string
): Promise<ListingDraftRecord | null> {
  // Verify item belongs to user
  const { data, error } = await supabaseAdmin
    .from('listing_drafts')
    .select(`
      *,
      items!inner(user_id)
    `)
    .eq('item_id', itemId)
    .eq('items.user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    logger.error({ error, itemId, userId }, 'Failed to get listing draft');
    throw new Error(`Failed to get listing draft: ${error.message}`);
  }

  return {
    id: data.id,
    item_id: data.item_id,
    title: data.title,
    description: data.description,
    condition: data.condition,
    item_specifics: data.item_specifics,
    suggested_price_min: data.suggested_price_min,
    suggested_price_max: data.suggested_price_max,
    suggested_price: data.suggested_price,
    price_confidence: data.price_confidence,
    category_id: data.category_id,
    keywords: data.keywords,
    ai_confidence: data.ai_confidence,
    visible_flaws: data.visible_flaws,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Update listing draft
 */
export async function updateListingDraft(
  itemId: string,
  userId: string,
  draft: Partial<ListingDraft>
): Promise<ListingDraftRecord> {
  // Verify item belongs to user first
  const existing = await getListingDraft(itemId, userId);
  if (!existing) {
    throw new Error('Listing draft not found or access denied');
  }

  const updateData: any = {};

  if (draft.title !== undefined) updateData.title = draft.title;
  if (draft.description !== undefined) updateData.description = draft.description;
  if (draft.condition !== undefined) updateData.condition = draft.condition;
  if (draft.itemSpecifics !== undefined) updateData.item_specifics = draft.itemSpecifics;
  if (draft.pricing !== undefined) {
    updateData.suggested_price_min = draft.pricing.min;
    updateData.suggested_price_max = draft.pricing.max;
    updateData.suggested_price = draft.pricing.suggested;
    updateData.price_confidence = draft.pricing.confidence;
  }
  if (draft.categoryId !== undefined) updateData.category_id = draft.categoryId;
  if (draft.keywords !== undefined) updateData.keywords = draft.keywords;
  if (draft.aiConfidence !== undefined) updateData.ai_confidence = draft.aiConfidence;
  if (draft.visibleFlaws !== undefined) updateData.visible_flaws = draft.visibleFlaws;

  const { data, error } = await supabaseAdmin
    .from('listing_drafts')
    .update(updateData)
    .eq('item_id', itemId)
    .select()
    .single();

  if (error) {
    logger.error({ error, itemId, userId, draft }, 'Failed to update listing draft');
    throw new Error(`Failed to update listing draft: ${error.message}`);
  }

  return {
    id: data.id,
    item_id: data.item_id,
    title: data.title,
    description: data.description,
    condition: data.condition,
    item_specifics: data.item_specifics,
    suggested_price_min: data.suggested_price_min,
    suggested_price_max: data.suggested_price_max,
    suggested_price: data.suggested_price,
    price_confidence: data.price_confidence,
    category_id: data.category_id,
    keywords: data.keywords,
    ai_confidence: data.ai_confidence,
    visible_flaws: data.visible_flaws,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

