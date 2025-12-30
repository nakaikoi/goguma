/**
 * AI Analysis API routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { handleError, AppError } from '../utils/errors.js';
import { analyzeItemImagesWithRetry } from '../services/ai/openai-service.js';
import { getItemImages } from '../services/db/images.js';
import { getItemById, updateItemStatus } from '../services/db/items.js';
import { createListingDraft, getListingDraft } from '../services/db/drafts.js';
import { ItemStatus } from '@goguma/shared';

export async function aiRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // POST /api/v1/items/:id/analyze - Trigger AI analysis
  fastify.post(
    '/items/:id/analyze',
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

        // Get images for the item
        const images = await getItemImages(request.params.id, request.user.id);

        if (images.length === 0) {
          throw new AppError(
            'BAD_REQUEST',
            'Item must have at least one image to analyze',
            400
          );
        }

        // Update item status to processing
        await updateItemStatus(request.params.id, request.user.id, 'processing');

        try {
          // Get storage paths from images
          const storagePaths = images.map((img) => img.storage_path);

          // Run AI analysis
          const draft = await analyzeItemImagesWithRetry(
            storagePaths,
            request.params.id
          );

          // Save draft to database
          await createListingDraft(request.params.id, draft);

          // Update item status to ready
          await updateItemStatus(request.params.id, request.user.id, 'ready');

          return reply.code(200).send({
            data: {
              success: true,
              message: 'AI analysis completed successfully',
              draft: {
                title: draft.title,
                description: draft.description,
                condition: draft.condition,
                itemSpecifics: draft.itemSpecifics,
                pricing: draft.pricing,
                keywords: draft.keywords,
                aiConfidence: draft.aiConfidence,
              },
            },
          });
        } catch (error) {
          // Update item status back to draft on error
          await updateItemStatus(request.params.id, request.user.id, 'draft');
          throw error;
        }
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // GET /api/v1/items/:id/draft - Get listing draft
  fastify.get(
    '/items/:id/draft',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        const draft = await getListingDraft(request.params.id, request.user.id);

        if (!draft) {
          throw new AppError('NOT_FOUND', 'Listing draft not found', 404);
        }

        return reply.send({
          data: {
            id: draft.id,
            itemId: draft.item_id,
            title: draft.title,
            description: draft.description,
            condition: draft.condition,
            itemSpecifics: draft.item_specifics,
            pricing: {
              min: draft.suggested_price_min,
              max: draft.suggested_price_max,
              suggested: draft.suggested_price,
              confidence: draft.price_confidence,
              currency: 'USD',
            },
            categoryId: draft.category_id,
            keywords: draft.keywords,
            aiConfidence: draft.ai_confidence,
            visibleFlaws: draft.visible_flaws,
            createdAt: draft.created_at,
            updatedAt: draft.updated_at,
          },
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );
}

