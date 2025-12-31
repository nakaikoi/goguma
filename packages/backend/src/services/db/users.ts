/**
 * Database service for users
 */

import { supabaseAdmin } from '../../config/supabase.js';
import { logger } from '../../config/logger.js';

/**
 * Ensure user exists in users table
 * Creates user record if it doesn't exist
 */
export async function ensureUserExists(
  userId: string,
  email?: string
): Promise<void> {
  // Check if user exists
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 is "not found" - that's okay, we'll create it
    logger.error({ error: checkError, userId }, 'Failed to check user existence');
    throw new Error(`Failed to check user existence: ${checkError.message}`);
  }

  // If user doesn't exist, create it
  if (!existingUser) {
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email || null,
      });

    if (insertError) {
      logger.error({ error: insertError, userId, email }, 'Failed to create user');
      throw new Error(`Failed to create user: ${insertError.message}`);
    }

    logger.debug({ userId, email }, 'Created user record');
  }
}

