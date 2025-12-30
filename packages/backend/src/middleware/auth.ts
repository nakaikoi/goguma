/**
 * Authentication middleware for Fastify
 * Verifies Supabase JWT tokens and extracts user ID
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../config/supabase.js';
import { logger } from '../config/logger.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error }, 'Invalid authentication token');
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
    };

    logger.debug({ userId: user.id }, 'User authenticated');
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    return reply.code(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

