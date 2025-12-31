/**
 * Items API routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import {
  createItem,
  getItemById,
  listItems,
  updateItemStatus,
  deleteItem,
} from '../services/db/items.js';
import { handleError, AppError } from '../utils/errors.js';
import { ItemStatusSchema } from '@goguma/shared';
import { z } from 'zod';

const createItemSchema = z.object({});

const updateItemStatusSchema = z.object({
  status: ItemStatusSchema,
});

const listItemsQuerySchema = z.object({
  status: ItemStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export async function itemsRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // POST /api/v1/items - Create new item
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
      }

      const body = createItemSchema.parse(request.body);

      const item = await createItem({
        userId: request.user.id,
        userEmail: request.user.email,
      });

      return reply.code(201).send({
        data: {
          id: item.id,
          userId: item.user_id,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  // GET /api/v1/items - List items
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
      }

      const query = listItemsQuerySchema.parse(request.query);

      const result = await listItems(request.user.id, {
        status: query.status,
        limit: query.limit,
        offset: query.offset,
      });

      return reply.send({
        data: result.items.map((item) => ({
          id: item.id,
          userId: item.user_id,
          status: item.status,
          draftTitle: item.draftTitle || null,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        pagination: {
          limit: query.limit || 20,
          offset: query.offset || 0,
          total: result.total,
        },
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  // GET /api/v1/items/:id - Get item
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        const item = await getItemById(request.params.id, request.user.id);

        if (!item) {
          throw new AppError('NOT_FOUND', 'Item not found', 404);
        }

        return reply.send({
          data: {
            id: item.id,
            userId: item.user_id,
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          },
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // PATCH /api/v1/items/:id - Update item status
  fastify.patch(
    '/:id',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { status: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        const body = updateItemStatusSchema.parse(request.body);

        const item = await updateItemStatus(
          request.params.id,
          request.user.id,
          body.status
        );

        return reply.send({
          data: {
            id: item.id,
            status: item.status,
            updatedAt: item.updated_at,
          },
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // DELETE /api/v1/items/:id - Delete item
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        if (!request.user) {
          throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
        }

        await deleteItem(request.params.id, request.user.id);

        return reply.code(204).send();
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );
}

