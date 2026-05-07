/**
 * Error Handler Middleware
 *
 * Tratamento centralizado de erros
 */

import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Manipulador de erros global
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error, '[Error] Erro na requisição');

  // Erros de validação
  if (error.validation) {
    reply.status(400).send({
      error: 'Erro de validação',
      details: error.validation
    });
    return;
  }

  // Erros de cliente (4xx)
  if (error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      error: error.message || 'Erro do cliente'
    });
    return;
  }

  // Erros de servidor (5xx)
  reply.status(500).send({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
