/**
 * MCP Protocol Types
 *
 * Define contratos de mensagem para comunicação entre
 * Chat Bot e MCP Server seguindo o protocolo MCP (Model Context Protocol)
 */

/**
 * Request do Chat Bot ao MCP Server
 */
export interface MCPRequest {
  id: string;  // UUID da requisição
  timestamp: Date;
  query: string;  // Pergunta em linguagem natural
  context?: MCPRequestContext;
  options?: MCPRequestOptions;
}

/**
 * Contexto adicional da requisição
 */
export interface MCPRequestContext {
  user_id?: string;
  conversation_id?: string;
  previous_queries?: string[];
}

/**
 * Opções de configuração da requisição
 */
export interface MCPRequestOptions {
  max_results?: number;
  filters?: FiltrosBusca;
  include_attachments?: boolean;
  search_strategy?: SearchStrategy;
}

/**
 * Filtros estruturados para busca
 */
export interface FiltrosBusca {
  temas?: number[];           // IDs de temas (t_tema.id_tema)
  escalas?: string[];         // Códigos de escala (t_escala.codigo_escala)
  anos?: string[];            // Anos (t_ano.codigo_ano)
  classes?: number[];         // IDs de classe (t_classe_mapa.id_classe_mapa)
  regioes?: number[];         // IDs de regiões (t_regiao.id_regiao)
  municipios?: number[];      // Códigos IBGE de municípios (t_municipio.codmun)
  possui_pdf?: boolean;       // Filtrar apenas publicações com PDF
}

/**
 * Estratégias de busca disponíveis
 */
export type SearchStrategy = 'semantic' | 'filtered' | 'hybrid';

/**
 * Response do MCP Server ao Chat Bot
 */
export interface MCPResponse {
  id: string;  // Mesmo ID da requisição
  timestamp: Date;
  status: MCPResponseStatus;
  data: MCPResponseData;
  context?: MCPResponseContext;
  error?: MCPError;
}

/**
 * Status da resposta
 */
export type MCPResponseStatus = 'success' | 'error' | 'partial';

/**
 * Dados da resposta
 */
export interface MCPResponseData {
  query: string;
  results: import('./publicacao.types').PublicacaoBase[];
  total_count: number;
  search_strategy_used: string;
  filters_applied: FiltrosBusca;
  execution_time_ms: number;
}

/**
 * Contexto adicional da resposta
 */
export interface MCPResponseContext {
  related_topics?: string[];
  suggested_queries?: string[];
  attachments_summary?: {
    total_with_pdf: number;
    total_size_bytes: number;
  };
}

/**
 * Erro na resposta
 */
export interface MCPError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Chunk de resposta para streaming (futuro)
 */
export interface MCPResponseChunk {
  request_id: string;
  chunk_index: number;
  total_chunks: number;
  data: Partial<MCPResponseData>;
}
