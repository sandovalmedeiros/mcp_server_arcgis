/**
 * MCP Client
 *
 * Cliente principal que orquestra RAG Engine e ArcGIS Client
 * Implementa o protocolo Model Context Protocol
 */

import type { RAGEngine, SearchResult } from '@mcp-server/rag-engine';
import type { ArcGISRESTClient } from '@mcp-server/arcgis-client';
import type { PublicacaoBase } from '@mcp-server/shared-types';

/**
 * Configuração do MCP Client
 */
interface MCPClientConfig {
  ragEngine: RAGEngine;
  arcgisClient: ArcGISRESTClient;
}

/**
 * Resposta do MCP
 */
interface MCPResponse {
  query: string;
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  context: {
    indexed_documents: number;
    search_strategy: string;
  };
}

/**
 * MCP Client - Implementation
 */
export class MCPClient {
  constructor(private config: MCPClientConfig) {}

  /**
   * Query principal do MCP
   * Processa query textual e retorna resultados relevantes
   */
  async query(
    queryText: string,
    options: {
      maxResults?: number;
      threshold?: number;
      includeDomains?: boolean;
    } = {}
  ): Promise<MCPResponse> {
    const { maxResults = 10, threshold = 0.5 } = options;

    // Executa busca híbrida
    const results = await this.config.ragEngine.search(queryText, {
      maxResults,
      threshold
    });

    // Busca estatísticas do índice
    const stats = await this.config.ragEngine.getIndexStats();

    return {
      query: queryText,
      results,
      total: results.length,
      hasMore: results.length === maxResults,
      context: {
        indexed_documents: stats.document_count,
        search_strategy: 'hybrid'
      }
    };
  }

  /**
   * Busca com filtros estruturados
   */
  async filteredQuery(
    filters: any,
    options: {
      maxResults?: number;
    } = {}
  ): Promise<MCPResponse> {
    const results = await this.config.ragEngine.filteredSearch(filters);

    return {
      query: JSON.stringify(filters),
      results,
      total: results.length,
      hasMore: false,
      context: {
        indexed_documents: 0,
        search_strategy: 'filtered'
      }
    };
  }

  /**
   * Retorna contexto sobre uma publicação específica
   */
  async getPublicationContext(globalid: string): Promise<any> {
    // Tenta buscar em estaduais/regionais
    let pub = await this.config.arcgisClient.getPublicacaoByGlobalIdSafe(globalid, false);

    // Se não encontrou, busca em municipais
    if (!pub) {
      pub = await this.config.arcgisClient.getPublicacaoByGlobalIdSafe(globalid, true);
    }

    if (!pub) {
      throw new Error(`Publicação não encontrada: ${globalid}`);
    }

    // Busca anexos
    const isMunicipal = 'codmun' in pub;
    const attachments = await this.config.arcgisClient.getAttachments(
      globalid,
      isMunicipal
    );

    return {
      publicacao: pub,
      attachments: attachments || [],
      possui_pdf: (attachments || []).length > 0
    };
  }

  /**
   * Lista domínios disponíveis para filtros
   */
  async listDomains(domainType?: 'temas' | 'escalas' | 'anos' | 'classes' | 'regioes' | 'municipios'): Promise<any> {
    if (!domainType) {
      // Retorna todos os domínios
      const [temas, escalas, anos, classes, regioes] = await Promise.all([
        this.config.arcgisClient.getTemas(),
        this.config.arcgisClient.getEscalas(),
        this.config.arcgisClient.getAnos(),
        this.config.arcgisClient.getClasses(),
        this.config.arcgisClient.getRegioes()
      ]);

      return { temas, escalas, anos, classes, regioes };
    }

    // Retorna domínio específico
    switch (domainType) {
      case 'temas':
        return await this.config.arcgisClient.getTemas();
      case 'escalas':
        return await this.config.arcgisClient.getEscalas();
      case 'anos':
        return await this.config.arcgisClient.getAnos();
      case 'classes':
        return await this.config.arcgisClient.getClasses();
      case 'regioes':
        return await this.config.arcgisClient.getRegioes();
      case 'municipios':
        return await this.config.arcgisClient.getMunicipios({ limit: 1000, offset: 0 });
      default:
        throw new Error(`Tipo de domínio inválido: ${domainType}`);
    }
  }

  /**
   * Retorna estatísticas do sistema
   */
  async getStats(): Promise<any> {
    const [ragStats, arcgisHealth] = await Promise.all([
      this.config.ragEngine.getIndexStats(),
      this.config.arcgisClient.healthCheck()
    ]);

    return {
      rag: ragStats,
      arcgis: {
        status: arcgisHealth
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reindexa todos os documentos
   */
  async reindex(): Promise<void> {
    await this.config.ragEngine.clearIndex();
    await this.config.ragEngine.initialize();
  }
}
