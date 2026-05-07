/**
 * RAG Engine Interface
 *
 * Define contratos para o motor de busca híbrida
 * (Retrieval-Augmented Generation)
 */

import { PublicacaoBase, FiltrosBusca } from '@mcp-server/shared-types';

/**
 * Opções de busca
 */
export interface SearchOptions {
  maxResults?: number;
  filters?: FiltrosBusca;
  threshold?: number;  // Similaridade mínima (0-1)
}

/**
 * Resultado de busca com score
 */
export interface SearchResult {
  publicacao: PublicacaoBase;
  score: number;  // Relevância (0-1)
  match_type: 'semantic' | 'filtered' | 'hybrid';
}

/**
 * Estratégias de busca disponíveis
 */
export type SearchStrategy = 'semantic' | 'filtered' | 'hybrid';

/**
 * Estatísticas do índice
 */
export interface IndexStats {
  document_count: number;
  last_indexed: Date;
  vector_dimension: number;
  model_name: string;
}

/**
 * Interface principal do RAG Engine
 */
export interface IRAGEngine {
  // Inicialização e indexação
  initialize(): Promise<void>;
  indexPublicacao(publicacao: PublicacaoBase): Promise<void>;
  indexBatch(publicacoes: PublicacaoBase[]): Promise<void>;

  // Busca híbrida
  search(query: string, options: SearchOptions): Promise<SearchResult[]>;

  // Estratégias de busca
  semanticSearch(query: string, options: SearchOptions): Promise<SearchResult[]>;
  filteredSearch(filters: FiltrosBusca): Promise<SearchResult[]>;
  hybridSearch(query: string, filters: FiltrosBusca, options: SearchOptions): Promise<SearchResult[]>;

  // Gerenciamento de vector store
  clearIndex(): Promise<void>;
  getIndexStats(): Promise<IndexStats>;
}
