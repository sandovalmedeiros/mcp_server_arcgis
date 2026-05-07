/**
 * Fastify Instance Type Extensions
 *
 * Declara propriedades customizadas no FastifyInstance
 */

import type { RAGEngine } from '@mcp-server/rag-engine';
import type { ArcGISRESTClient } from '@mcp-server/arcgis-client';
import type { MCPClient } from '../mcp/mcp-client.js';

declare module 'fastify' {
  interface FastifyInstance {
    ragEngine: RAGEngine;
    arcgisClient: ArcGISRESTClient;
    mcpClient: MCPClient;
  }
}
