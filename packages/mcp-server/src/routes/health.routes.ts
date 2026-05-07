/**
 * Health Check Routes
 *
 * Endpoints para verificação de saúde do servidor
 */

import type { FastifyInstance } from 'fastify';
import type { ArcGISRESTClient } from '@mcp-server/arcgis-client';
import type { RAGEngine } from '@mcp-server/rag-engine';

/**
 * Response do health check
 */
interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  services: {
    arcgis: string;
    rag: string;
  };
}

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /health
  fastify.get('/health', async (request, reply) => {
    const arcgisClient = fastify.arcgisClient as ArcGISRESTClient;
    const ragEngine = fastify.ragEngine as RAGEngine;

    // Verifica saúde dos serviços
    const arcgisHealth = await arcgisClient.healthCheck().catch(() => ({
      status: 'unhealthy' as const,
      latency_ms: 0,
      featureServerUrl: '',
      mapServerUrl: ''
    }));
    const ragStats = await ragEngine.getIndexStats();

    const response: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        arcgis: arcgisHealth.status,
        rag: ragStats.document_count > 0 ? 'healthy' : 'initializing'
      }
    };

    return reply.send(response);
  });

  // GET / (root)
  fastify.get('/', async (request, reply) => {
    return reply.send({
      name: 'MCP Server - Mapoteca Digital',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });

  // GET /ready (readiness probe)
  fastify.get('/ready', async (request, reply) => {
    const ragEngine = fastify.ragEngine as RAGEngine;
    const stats = await ragEngine.getIndexStats();

    if (stats.document_count === 0) {
      return reply.status(503).send({
        status: 'not_ready',
        message: 'RAG Engine ainda está indexando documentos'
      });
    }

    return reply.send({
      status: 'ready',
      indexed_documents: stats.document_count
    });
  });
}
