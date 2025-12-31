/**
 * Supabase Storage service for uploading images
 */

import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../config/logger.js';

export interface UploadImageOptions {
  userId: string;
  itemId: string;
  imageId: string;
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/**
 * Upload image to Supabase Storage
 * Structure: item-images/{userId}/{itemId}/original_{imageId}.jpg
 */
export async function uploadImage(
  options: UploadImageOptions
): Promise<string> {
  const { userId, itemId, imageId, buffer, filename, contentType } = options;

  const storagePath = `${userId}/${itemId}/original_${imageId}.${filename.split('.').pop() || 'jpg'}`;

  try {
    logger.info({ storagePath, size: buffer.length }, 'Starting Supabase upload...');
    const startTime = Date.now();
    
    const { data, error } = await supabaseAdmin.storage
      .from('item-images')
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    const uploadTime = Date.now() - startTime;
    logger.info({ storagePath, uploadTime: `${uploadTime}ms` }, 'Supabase upload completed');

    if (error) {
      logger.error({ error, storagePath }, 'Failed to upload image');
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    logger.info({ storagePath, size: buffer.length }, 'Image uploaded successfully');

    return storagePath;
  } catch (error) {
    logger.error({ error, storagePath }, 'Image upload error');
    throw error;
  }
}

/**
 * Upload processed/compressed image
 */
export async function uploadProcessedImage(
  options: UploadImageOptions
): Promise<string> {
  const { userId, itemId, imageId, buffer, filename } = options;

  const storagePath = `${userId}/${itemId}/compressed_${imageId}.${filename.split('.').pop() || 'jpg'}`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('item-images')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      logger.error({ error, storagePath }, 'Failed to upload processed image');
      throw new Error(`Failed to upload processed image: ${error.message}`);
    }

    return storagePath;
  } catch (error) {
    logger.error({ error, storagePath }, 'Processed image upload error');
    throw error;
  }
}

/**
 * Upload thumbnail
 */
export async function uploadThumbnail(
  options: UploadImageOptions
): Promise<string> {
  const { userId, itemId, imageId, buffer } = options;

  const storagePath = `${userId}/${itemId}/thumbnail_${imageId}.jpg`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('item-images')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      logger.error({ error, storagePath }, 'Failed to upload thumbnail');
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }

    return storagePath;
  } catch (error) {
    logger.error({ error, storagePath }, 'Thumbnail upload error');
    throw error;
  }
}

/**
 * Get public URL for an image (signed URL, expires in 1 hour)
 */
export async function getImageUrl(storagePath: string): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('item-images')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      logger.error({ error, storagePath }, 'Failed to create signed URL');
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    logger.error({ error, storagePath }, 'Get image URL error');
    throw error;
  }
}

/**
 * Delete image from storage
 */
export async function deleteImage(storagePath: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('item-images')
      .remove([storagePath]);

    if (error) {
      logger.error({ error, storagePath }, 'Failed to delete image');
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    logger.debug({ storagePath }, 'Image deleted');
  } catch (error) {
    logger.error({ error, storagePath }, 'Delete image error');
    throw error;
  }
}

