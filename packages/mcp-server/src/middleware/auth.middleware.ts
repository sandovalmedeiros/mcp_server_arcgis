/**
 * Authentication Middleware
 *
 * Valida API Key nas requisições
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config/config.js';

/**
 * Extrai API Key da requisição (header ou query param)
 */
function extractApiKey(request: FastifyRequest): string | undefined {
  // Tenta header x-api-key
  const headerKey = request.headers['x-api-key'] as string;
  if (headerKey) {
    return headerKey;
  }

  // Tenta query param api_key
  const queryKey = (request.query as any).api_key;
  if (queryKey) {
    return queryKey;
  }

  return undefined;
}

/**
 * Middleware de autenticação
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth para health check
  if (request.url === '/' || request.url === '/health') {
    return;
  }

  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return reply.status(401).send({
      error: 'API Key não fornecida',
      message: 'Forneça x-api-key header ou api_key query parameter'
    });
  }

  if (!config.apiKeys.includes(apiKey)) {
    return reply.status(403).send({
      error: 'API Key inválida',
      message: 'A API Key fornecida não tem permissão para acessar este recurso'
    });
  }

  // API Key válida, continua
}
