/**
 * Images API routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import {
  createImage,
  getItemImages,
  deleteImage as deleteImageRecord,
  reorderImages,
} from '../services/db/images.js';
import {
  processImage,
  generateThumbnail,
  validateImageFile,
} from '../services/image-processing.js';
import {
  uploadImage,
  uploadProcessedImage,
  uploadThumbnail,
  getImageUrl,
  deleteImage as deleteImageFromStorage,
} from '../services/storage.js';
import { handleError, AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';
import { getItemById } from '../services/db/items.js';

export async function imagesRoutes(fastify: FastifyInstance) {
  // Register multipart plugin for file uploads
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // POST /api/v1/items/:id/images - Upload images
  fastify.post(
    '/items/:id/images',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        // Verify item exists and belongs to user
        const item = await getItemById(request.params.id, request.user.id);
        if (!item) {
          throw new AppError('NOT_FOUND', 'Item not found', 404);
        }

        const uploadedImages = [];
        
        request.log.info('Starting to parse multipart request...');
        
        // Parse multipart files directly from request
        // This works better with React Native FormData than saveRequestFiles()
        const data: any[] = [];
        const parts = request.parts();
        
        request.log.info('Got parts iterator, starting to iterate...');
        
        for await (const part of parts) {
          request.log.debug({ partType: part.type, fieldname: part.fieldname }, 'Processing part');
          if (part.type === 'file') {
            data.push(part);
            request.log.info({ filename: part.filename, count: data.length }, 'File part received');
          }
        }
        
        request.log.info({ fileCount: data.length }, 'Files received from multipart');
        
        if (data.length === 0) {
          throw new AppError('BAD_REQUEST', 'No files found in request', 400);
        }

        // Process images - simplified to avoid timeout
        // For now, skip heavy processing and just upload
        for (let i = 0; i < data.length; i++) {
          const file = data[i];
          const imageId = randomUUID();

          try {
            // Validate file
            // For multipart parts, mimetype and encoding are on the part object
            const mimetype = file.mimetype || 'image/jpeg';
            const fileSize = file.file ? file.file.bytesRead : 0;
            
            validateImageFile(mimetype, fileSize);

            // Read file buffer
            const buffer = await file.toBuffer();

            // Check if buffer is valid
            if (!buffer || buffer.length === 0) {
              throw new Error('File buffer is empty or invalid');
            }

            request.log.info(
              { 
                filename: file.filename, 
                size: buffer.length, 
                mimetype: file.mimetype,
                fieldname: file.fieldname,
              },
              'Processing image file'
            );

            // For now, just upload original - skip processing to avoid timeout
            // TODO: Add background job for image processing
            const originalPath = await uploadImage({
              userId: request.user.id,
              itemId: request.params.id,
              imageId,
              buffer,
              filename: file.filename || 'image.jpg',
              contentType: mimetype,
            });

            // Create database record (use original path for now)
            const imageRecord = await createImage({
              itemId: request.params.id,
              storagePath: originalPath,
              orderIndex: i,
            });

            // Get signed URL
            const url = await getImageUrl(originalPath);

            uploadedImages.push({
              id: imageRecord.id,
              itemId: imageRecord.item_id,
              storagePath: imageRecord.storage_path,
              orderIndex: imageRecord.order_index,
              url,
              createdAt: imageRecord.created_at,
            });
          } catch (error) {
            // Log error but continue with other images
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            request.log.error(
              {
                error: errorMessage,
                errorStack,
                filename: file.filename,
                fieldname: file.fieldname,
                mimetype: file.mimetype,
                size: file.file?.bytesRead || 0,
              },
              'Failed to process image'
            );
            // Don't throw - allow other images to be processed
          }
        }

        if (uploadedImages.length === 0) {
          throw new AppError('BAD_REQUEST', 'No images were successfully uploaded', 400);
        }

        return reply.code(201).send({
          data: uploadedImages,
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // GET /api/v1/items/:id/images - Get item images
  fastify.get(
    '/items/:id/images',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        const images = await getItemImages(request.params.id, request.user.id);

        // Get signed URLs for all images
        const imagesWithUrls = await Promise.all(
          images.map(async (image) => {
            const url = await getImageUrl(image.storage_path);
            return {
              id: image.id,
              itemId: image.item_id,
              storagePath: image.storage_path,
              orderIndex: image.order_index,
              url,
              createdAt: image.created_at,
            };
          })
        );

        return reply.send({
          data: imagesWithUrls,
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // DELETE /api/v1/images/:id - Delete image
  fastify.delete(
    '/images/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        // Delete from database (verifies ownership)
        const { storagePath } = await deleteImageRecord(
          request.params.id,
          request.user.id
        );

        // Delete from storage
        try {
          await deleteImageFromStorage(storagePath);
        } catch (error) {
          // Log but don't fail - DB record is already deleted
          request.log.warn({ error, storagePath }, 'Failed to delete from storage');
        }

        return reply.code(204).send();
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // PATCH /api/v1/items/:id/images/reorder - Reorder images
  fastify.patch(
    '/items/:id/images/reorder',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { imageIds: string[] };
      }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        const { imageIds } = request.body;

        if (!Array.isArray(imageIds) || imageIds.length === 0) {
          throw new AppError('BAD_REQUEST', 'imageIds must be a non-empty array', 400);
        }

        await reorderImages(request.params.id, request.user.id, imageIds);

        return reply.send({
          data: { success: true },
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );
}

