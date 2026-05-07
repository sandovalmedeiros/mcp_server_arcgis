/**
 * Configurações do MCP Server
 *
 * Centraliza todas as configurações de ambiente
 */

import dotenv from 'dotenv-safe';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a raiz do projeto (3 níveis acima de packages/mcp-server/dist/config)
const projectRoot = path.resolve(__dirname, '../../../../');

dotenv.config({
  example: path.join(projectRoot, '.env.example'),
  path: path.join(projectRoot, '.env'),
  allowEmptyValues: true
});

interface Config {
  // Server
  nodeId: string;
  port: number;
  host: string;
  nodeEnv: string;
  logLevel: string;
  corsOrigin: string;

  // ArcGIS
  arcgis: {
    featureServerUrl: string;
    mapServerUrl: string;
  };

  // API Keys
  apiKeys: string[];

  // RAG
  rag: {
    maxResults: number;
    threshold: number;
  };
}

export const config: Config = {
  nodeId: process.env.NODE_ID || 'mcp-server-1',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  arcgis: {
    featureServerUrl: process.env.ARCGIS_FEATURE_SERVER_URL ||
      'https://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/FeatureServer',
    mapServerUrl: process.env.ARCGIS_MAP_SERVER_URL ||
      'https://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer'
  },

  apiKeys: process.env.API_KEYS?.split(',') || ['dev-key-12345'],

  rag: {
    maxResults: parseInt(process.env.RAG_MAX_RESULTS || '10', 10),
    threshold: parseFloat(process.env.RAG_THRESHOLD || '0.5')
  }
};
