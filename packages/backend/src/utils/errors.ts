/**
 * Error handling utilities
 */

import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle errors and send appropriate response
 */
export function handleError(error: unknown, reply: FastifyReply): void {
  if (error instanceof AppError) {
    logger.warn({ error: error.code, details: error.details }, error.message);
    return reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error instanceof ZodError) {
    logger.warn({ validationErrors: error.errors }, 'Validation error');
    return reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors,
      },
    });
  }

  // Unknown error
  logger.error({ error }, 'Unhandled error');
  return reply.code(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

