/**
 * MCP Server - Main Entry Point
 *
 * Servidor Fastify que orquestra todos os componentes do MCP Server
 * - Integra RAGEngine para busca híbrida
 * - Integra ArcGISClient para dados estruturados
 * - Expõe API REST para integração com Chat Bot
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/config.js';
import { MCPClient } from './mcp/mcp-client.js';
import { ArcGISRESTClient } from '@mcp-server/arcgis-client';
import { RAGEngine } from '@mcp-server/rag-engine';
import { healthRoutes } from './routes/health.routes.js';
import { queryRoutes } from './routes/query.routes.js';
import { domainsRoutes } from './routes/domains.routes.js';
import { publicacaoRoutes } from './routes/publicacao.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import './types/index.js';

/**
 * Cria e configura o servidor Fastify
 */
async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: config.logLevel
    }
  });

  // Register CORS
  await server.register(cors, {
    origin: config.corsOrigin,
    credentials: true
  });

  // Register middleware
  server.addHook('onRequest', authMiddleware);
  server.setErrorHandler(errorHandler);

  // Inicializa clientes e serviços
  const arcgisClient = new ArcGISRESTClient({
    featureServerUrl: config.arcgis.featureServerUrl,
    mapServerUrl: config.arcgis.mapServerUrl
  });

  const ragEngine = new RAGEngine({
    arcgisClient
  });

  const mcpClient = new MCPClient({
    ragEngine,
    arcgisClient
  });

  // Inicializa RAG Engine (carrega e indexa publicações)
  await ragEngine.initialize();

  // Decorate fastify instance com os serviços
  server.decorate('ragEngine', ragEngine);
  server.decorate('arcgisClient', arcgisClient);
  server.decorate('mcpClient', mcpClient);

  // Register routes
  await server.register(healthRoutes, { prefix: '/' });
  await server.register(queryRoutes, { prefix: '/api/v1' });
  await server.register(domainsRoutes, { prefix: '/api/v1' });
  await server.register(publicacaoRoutes, { prefix: '/api/v1' });

  // Graceful shutdown
  server.addHook('onClose', async () => {
    server.log.info('[Server] Encerrando graceful shutdown...');
  });

  return server;
}

/**
 * Inicia o servidor
 */
async function start(): Promise<void> {
  try {
    const server = await createServer();

    await server.listen({
      port: config.port,
      host: config.host
    });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 MCP Server - Mapoteca Digital                   ║
║   Ambient: ${config.nodeId.padEnd(36)}║
║   Port: ${config.port.toString().padEnd(41)}║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('[Server] ❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

// Start se não estiver em modo teste
if (process.env.NODE_ENV !== 'test') {
  start();
}

export { createServer, start };
