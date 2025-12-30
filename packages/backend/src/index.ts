/**
 * @goguma/backend
 * Main entry point for the backend API server
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { itemsRoutes } from './routes/items.js';
import { imagesRoutes } from './routes/images.js';
import { handleError } from './utils/errors.js';

async function buildServer() {
  const server = Fastify({
    logger: false, // We use our own Pino logger
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
  });

  // Register CORS
  await server.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await server.register(itemsRoutes, { prefix: env.API_PREFIX + '/items' });
  await server.register(imagesRoutes, { prefix: env.API_PREFIX });

  // Global error handler
  server.setErrorHandler((error, request, reply) => {
    logger.error({ error, requestId: request.id }, 'Request error');
    return handleError(error, reply);
  });

  return server;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        apiPrefix: env.API_PREFIX,
      },
      '🚀 Goguma backend server started'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

start();
