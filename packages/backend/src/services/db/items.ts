/**
 * Database service for items
 */

import { supabaseAdmin } from '../../config/supabase.js';
import { logger } from '../../config/logger.js';
import { ItemStatus } from '@goguma/shared';
import { ensureUserExists } from './users.js';

export interface CreateItemInput {
  userId: string;
  userEmail?: string;
  status?: ItemStatus;
}

export interface Item {
  id: string;
  user_id: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new item
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  // Ensure user exists in users table (required for foreign key)
  await ensureUserExists(input.userId, input.userEmail);

  const { data, error } = await supabaseAdmin
    .from('items')
    .insert({
      user_id: input.userId,
      status: input.status || 'draft',
    })
    .select()
    .single();

  if (error) {
    logger.error({ error, input }, 'Failed to create item');
    throw new Error(`Failed to create item: ${error.message}`);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status as ItemStatus,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Get item by ID
 */
export async function getItemById(
  itemId: string,
  userId: string
): Promise<Item | null> {
  const { data, error } = await supabaseAdmin
    .from('items')
    .select()
    .eq('id', itemId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    logger.error({ error, itemId, userId }, 'Failed to get item');
    throw new Error(`Failed to get item: ${error.message}`);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status as ItemStatus,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * List items for a user
 */
export async function listItems(
  userId: string,
  options?: {
    status?: ItemStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ items: Item[]; total: number }> {
  let query = supabaseAdmin
    .from('items')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error({ error, userId, options }, 'Failed to list items');
    throw new Error(`Failed to list items: ${error.message}`);
  }

  return {
    items:
      data?.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        status: item.status as ItemStatus,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || [],
    total: count || 0,
  };
}

/**
 * Update item status
 */
export async function updateItemStatus(
  itemId: string,
  userId: string,
  status: ItemStatus
): Promise<Item> {
  const { data, error } = await supabaseAdmin
    .from('items')
    .update({ status })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error({ error, itemId, userId, status }, 'Failed to update item');
    throw new Error(`Failed to update item: ${error.message}`);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status as ItemStatus,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Delete item and all related data (images, drafts, storage files)
 */
export async function deleteItem(
  itemId: string,
  userId: string
): Promise<void> {
  // Verify item exists and belongs to user
  const item = await getItemById(itemId, userId);
  if (!item) {
    throw new Error('Item not found or access denied');
  }

  // Delete related images from database and storage
  const { data: images, error: imagesError } = await supabaseAdmin
    .from('item_images')
    .select('storage_path')
    .eq('item_id', itemId);

  if (imagesError) {
    logger.error({ error: imagesError, itemId }, 'Failed to fetch images for deletion');
  } else if (images && images.length > 0) {
    // Delete images from storage
    const storagePaths = images.map((img) => img.storage_path);
    const { error: storageError } = await supabaseAdmin.storage
      .from('item-images')
      .remove(storagePaths);

    if (storageError) {
      logger.error({ error: storageError, itemId, storagePaths }, 'Failed to delete images from storage');
      // Continue with database deletion even if storage deletion fails
    } else {
      logger.info({ itemId, imageCount: images.length }, 'Deleted images from storage');
    }

    // Delete images from database
    const { error: deleteImagesError } = await supabaseAdmin
      .from('item_images')
      .delete()
      .eq('item_id', itemId);

    if (deleteImagesError) {
      logger.error({ error: deleteImagesError, itemId }, 'Failed to delete images from database');
    } else {
      logger.info({ itemId, imageCount: images.length }, 'Deleted images from database');
    }
  }

  // Delete related drafts
  const { error: deleteDraftsError } = await supabaseAdmin
    .from('listing_drafts')
    .delete()
    .eq('item_id', itemId);

  if (deleteDraftsError) {
    logger.error({ error: deleteDraftsError, itemId }, 'Failed to delete drafts');
    // Continue with item deletion even if draft deletion fails
  } else {
    logger.info({ itemId }, 'Deleted drafts from database');
  }

  // Finally, delete the item itself
  const { error } = await supabaseAdmin
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    logger.error({ error, itemId, userId }, 'Failed to delete item');
    throw new Error(`Failed to delete item: ${error.message}`);
  }

  logger.info({ itemId, userId }, 'Item and all related data deleted successfully');
}

