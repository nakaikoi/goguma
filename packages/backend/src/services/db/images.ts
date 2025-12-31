/**
 * Database service for item images
 */

import { supabaseAdmin } from '../../config/supabase.js';
import { logger } from '../../config/logger.js';

export interface CreateImageInput {
  itemId: string;
  storagePath: string;
  orderIndex: number;
}

export interface Image {
  id: string;
  item_id: string;
  storage_path: string;
  order_index: number;
  created_at: string;
}

/**
 * Create image record
 */
export async function createImage(input: CreateImageInput): Promise<Image> {
  const { data, error } = await supabaseAdmin
    .from('item_images')
    .insert({
      item_id: input.itemId,
      storage_path: input.storagePath,
      order_index: input.orderIndex,
    })
    .select()
    .single();

  if (error) {
    logger.error({ error, input }, 'Failed to create image');
    throw new Error(`Failed to create image: ${error.message}`);
  }

  return {
    id: data.id,
    item_id: data.item_id,
    storage_path: data.storage_path,
    order_index: data.order_index,
    created_at: data.created_at,
  };
}

/**
 * Get images for an item
 */
export async function getItemImages(
  itemId: string,
  userId: string
): Promise<Image[]> {
  // Verify item belongs to user (via join)
  const { data, error } = await supabaseAdmin
    .from('item_images')
    .select(`
      *,
      items!inner(user_id)
    `)
    .eq('item_id', itemId)
    .eq('items.user_id', userId)
    .order('order_index', { ascending: true });

  if (error) {
    logger.error({ error, itemId, userId }, 'Failed to get item images');
    throw new Error(`Failed to get item images: ${error.message}`);
  }

  return (
    data?.map((img: any) => ({
      id: img.id,
      item_id: img.item_id,
      storage_path: img.storage_path,
      order_index: img.order_index,
      created_at: img.created_at,
    })) || []
  );
}

/**
 * Delete image
 */
export async function deleteImage(
  imageId: string,
  userId: string
): Promise<{ storagePath: string }> {
  // Get the image first, verify item ownership
  const { data: imageData, error: fetchError } = await supabase
    .from('item_images')
    .select('storage_path, item_id, items!inner(user_id)')
    .eq('id', imageId)
    .single();

  if (fetchError || !imageData) {
    logger.error({ error: fetchError, imageId, userId }, 'Image not found or access denied');
    throw new Error('Image not found or access denied');
  }

  // Now delete from database
  const { error: deleteError } = await supabase
    .from('item_images')
    .delete()
    .eq('id', imageId);

  if (deleteError) {
    logger.error({ error: deleteError, imageId, userId }, 'Failed to delete image');
    throw new Error(`Failed to delete image: ${deleteError.message}`);
  }

  return { storagePath: imageData.storage_path };
}

/**
 * Reorder images
 */
export async function reorderImages(
  itemId: string,
  userId: string,
  imageIds: string[]
): Promise<void> {
  // Verify item belongs to user
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', userId)
    .single();

  if (itemError || !item) {
    throw new Error('Item not found or access denied');
  }

  // Update order_index for each image
  const updates = imageIds.map((imageId, index) =>
    supabase
      .from('item_images')
      .update({ order_index: index })
      .eq('id', imageId)
      .eq('item_id', itemId)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    logger.error({ errors, itemId, userId, imageIds }, 'Failed to reorder images');
    throw new Error('Failed to reorder images');
  }
}

