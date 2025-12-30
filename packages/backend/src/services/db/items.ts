/**
 * Database service for items
 */

import { supabase } from '../../config/supabase.js';
import { logger } from '../../config/logger.js';
import { ItemStatus } from '@goguma/shared';

export interface CreateItemInput {
  userId: string;
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  let query = supabase
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
  const { data, error } = await supabase
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
 * Delete item
 */
export async function deleteItem(
  itemId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    logger.error({ error, itemId, userId }, 'Failed to delete item');
    throw new Error(`Failed to delete item: ${error.message}`);
  }
}

