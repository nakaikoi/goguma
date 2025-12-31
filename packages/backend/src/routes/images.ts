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
      const startTime = Date.now();
      const contentType = request.headers['content-type'];
      request.log.info({ 
        itemId: request.params.id, 
        method: request.method,
        url: request.url,
        headers: {
          'content-type': contentType,
          'content-length': request.headers['content-length'],
          'all-headers': Object.keys(request.headers),
        }
      }, 'Image upload request received');
      
      // Check if Content-Type is multipart
      if (!contentType || !contentType.includes('multipart/form-data')) {
        request.log.error({ contentType }, 'Invalid Content-Type for multipart upload');
        throw new AppError(
          'BAD_REQUEST',
          `Invalid Content-Type: ${contentType || 'missing'}. Expected multipart/form-data`,
          400
        );
      }
      
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        request.log.info({ userId: request.user.id }, 'User authenticated');

        // Verify item exists and belongs to user
        const item = await getItemById(request.params.id, request.user.id);
        if (!item) {
          throw new AppError('NOT_FOUND', 'Item not found', 404);
        }

        request.log.info('Item verified, starting multipart parse...');

        // Parse multipart files directly from request
        // This works better with React Native FormData than saveRequestFiles()
        const data: any[] = [];
        
        request.log.info('Getting parts iterator...');
        const parts = request.parts();
        request.log.info('Parts iterator obtained, starting iteration...');
        
        // Read all parts and their buffers into memory first
        // We need to consume the stream before sending response
        const fileBuffers: Array<{ buffer: Buffer; filename: string; mimetype: string; fieldname: string }> = [];
        
        for await (const part of parts) {
          request.log.info({ partType: part.type, fieldname: part.fieldname, filename: part.filename }, 'Processing part');
          if (part.type === 'file') {
            try {
              // Read file buffer immediately while we have the stream
              const readStartTime = Date.now();
              let buffer: Buffer;
              if (typeof part.toBuffer === 'function') {
                buffer = await part.toBuffer();
              } else if (part.file) {
                // Read from file stream
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                  chunks.push(chunk);
                }
                buffer = Buffer.concat(chunks);
              } else {
                throw new Error('Unable to read file data from multipart part');
              }
              
              const readTime = Date.now() - readStartTime;
              request.log.info({ 
                filename: part.filename, 
                size: buffer.length, 
                readTime: `${readTime}ms` 
              }, 'File buffer read from stream');
              
              fileBuffers.push({
                buffer,
                filename: part.filename || 'image.jpg',
                mimetype: part.mimetype || 'image/jpeg',
                fieldname: part.fieldname || 'images',
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              request.log.error({ error: errorMessage, filename: part.filename }, 'Failed to read file from stream');
            }
          }
        }
        
        request.log.info({ 
          fileCount: fileBuffers.length, 
          elapsed: `${Date.now() - startTime}ms` 
        }, 'All files read from multipart stream');
        
        if (fileBuffers.length === 0) {
          throw new AppError('BAD_REQUEST', 'No files found in request', 400);
        }

        // Now that we've consumed the stream, we can send response immediately
        // Process images asynchronously in background
        const processImagesAsync = async () => {
          const processedImages = [];
          
          for (let i = 0; i < fileBuffers.length; i++) {
            const file = fileBuffers[i];
            const imageId = randomUUID();

            try {
              request.log.info({ 
                index: i,
                filename: file.filename,
                size: file.buffer.length,
              }, `Processing image ${i + 1}/${fileBuffers.length}`);

              // Validate file
              validateImageFile(file.mimetype, file.buffer.length);

              if (!file.buffer || file.buffer.length === 0) {
                throw new Error('File buffer is empty or invalid');
              }

              // Upload to Supabase
              const uploadStartTime = Date.now();
              const originalPath = await uploadImage({
                userId: request.user.id,
                itemId: request.params.id,
                imageId,
                buffer: file.buffer,
                filename: file.filename,
                contentType: file.mimetype,
              });
              const uploadTime = Date.now() - uploadStartTime;
              request.log.info({ uploadTime: `${uploadTime}ms` }, 'Supabase upload completed');

              // Create database record
              const imageRecord = await createImage({
                itemId: request.params.id,
                storagePath: originalPath,
                orderIndex: i,
              });

              // Get signed URL
              const url = await getImageUrl(originalPath);

              processedImages.push({
                id: imageRecord.id,
                itemId: imageRecord.item_id,
                storagePath: imageRecord.storage_path,
                orderIndex: imageRecord.order_index,
                url,
                createdAt: imageRecord.created_at,
              });
              
              request.log.info({ imageId: imageRecord.id }, `Image ${i + 1} processed successfully`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              request.log.error(
                {
                  error: errorMessage,
                  filename: file.filename,
                  index: i,
                },
                `Failed to process image ${i + 1}`
              );
            }
          }

          request.log.info(
            { 
              total: fileBuffers.length, 
              successful: processedImages.length,
              elapsed: `${Date.now() - startTime}ms`,
              itemId: request.params.id,
            },
            '✅ Image processing completed - all images uploaded and saved'
          );
        };

        // Start processing in background (don't await)
        processImagesAsync().catch((error) => {
          request.log.error({ error }, 'Background image processing failed');
        });

        // Return immediate response now that stream is consumed
        return reply.code(202).send({
          message: 'Image upload accepted, processing in background',
          itemId: request.params.id,
          imageCount: fileBuffers.length,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        request.log.error(
          {
            error: errorMessage,
            errorStack,
            itemId: request.params.id,
            userId: request.user?.id,
            errorType: error?.constructor?.name,
          },
          'Image upload route error'
        );
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

