/**
 * Query Routes
 *
 * Endpoints para busca de publicações (RAG)
 */

import type { FastifyInstance } from 'fastify';
import type { RAGEngine, SearchOptions } from '@mcp-server/rag-engine';
import type { FiltrosBusca } from '@mcp-server/shared-types';

/**
 * Schema de requisição de busca
 */
interface QueryRequest {
  query?: string;
  filters?: FiltrosBusca;
  strategy?: 'semantic' | 'filtered' | 'hybrid';
  maxResults?: number;
  threshold?: number;
}

export async function queryRoutes(fastify: FastifyInstance): Promise<void> {
  const ragEngine = fastify.ragEngine as RAGEngine;

  /**
   * POST /api/v1/query
   * Busca híbrida (semantic + filtered)
   */
  fastify.post('/query', async (request, reply) => {
    const body = request.body as QueryRequest;

    // Se não tem query nem filtros, retorna erro
    if (!body.query && !body.filters) {
      return reply.status(400).send({
        error: 'Parâmetros insuficientes',
        message: 'Forneça query ou filters'
      });
    }

    // Monta opções de busca
    const options: SearchOptions = {
      maxResults: body.maxResults || 10,
      threshold: body.threshold || 0.5
    };

    try {
      // Executa busca
      const results = await ragEngine.search(
        body.query || '',
        {
          filters: body.filters || {},
          ...options
        }
      );

      return reply.send({
        success: true,
        count: results.length,
        results: results.map(r => ({
          publicacao: r.publicacao,
          score: Math.round(r.score * 1000) / 1000,  // 3 casas decimais
          match_type: r.match_type
        }))
      });
    } catch (error: any) {
      request.log.error(error, '[Query] Erro na busca');
      return reply.status(500).send({
        error: 'Erro na busca',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/search/semantic
   * Busca apenas semântica
   */
  fastify.post('/search/semantic', async (request, reply) => {
    const body = request.body as { query: string } & SearchOptions;

    if (!body.query) {
      return reply.status(400).send({
        error: 'Query não fornecida'
      });
    }

    const results = await ragEngine.semanticSearch(body.query, {
      maxResults: body.maxResults || 10,
      threshold: body.threshold || 0.5
    });

    return reply.send({
      success: true,
      strategy: 'semantic',
      count: results.length,
      results
    });
  });

  /**
   * POST /api/v1/search/filtered
   * Busca apenas filtrada
   */
  fastify.post('/search/filtered', async (request, reply) => {
    const body = request.body as { filters: FiltrosBusca };

    if (!body.filters) {
      return reply.status(400).send({
        error: 'Filtros não fornecidos'
      });
    }

    const results = await ragEngine.filteredSearch(body.filters);

    return reply.send({
      success: true,
      strategy: 'filtered',
      count: results.length,
      results
    });
  });

  /**
   * POST /api/v1/search/hybrid
   * Busca híbrida explícita
   */
  fastify.post('/search/hybrid', async (request, reply) => {
    const body = request.body as {
      query: string;
      filters?: FiltrosBusca;
    } & SearchOptions;

    if (!body.query) {
      return reply.status(400).send({
        error: 'Query não fornecida'
      });
    }

    const results = await ragEngine.hybridSearch(
      body.query,
      body.filters || {},
      {
        maxResults: body.maxResults || 10,
        threshold: body.threshold || 0.5
      }
    );

    return reply.send({
      success: true,
      strategy: 'hybrid',
      count: results.length,
      results
    });
  });
}
