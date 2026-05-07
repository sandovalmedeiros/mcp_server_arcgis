/**
 * Semantic Search Strategy
 *
 * Busca vetorial por similaridade semântica usando embeddings
 */

import type { SearchOptions, SearchResult } from '../rag-engine.interface.js';
import type { PublicacaoBase } from '@mcp-server/shared-types';
import type { IVectorStore } from '../vector-store/vector-store.interface.js';
import type { IEmbeddingsService } from '../embeddings/embeddings.interface.js';
import type { ITextProcessor } from '../embeddings/text-processor.interface.js';

export class SemanticSearchStrategy {
  constructor(
    private vectorStore: IVectorStore,
    private embeddingsService: IEmbeddingsService,
    private textProcessor: ITextProcessor
  ) {}

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    console.log(`[SemanticSearch] Buscando: "${query}"`);

    // Gera embedding da query
    const queryEmbedding = await this.embeddingsService.embedText(query);

    // Busca vetorial
    const maxResults = options.maxResults || 10;
    const threshold = options.threshold || 0.0;

    const documents = await this.vectorStore.similaritySearch(
      queryEmbedding,
      maxResults
    );

    // Filtra por threshold
    const filtered = documents.filter(doc => doc.score >= threshold);

    // Converte para SearchResult
    const results: SearchResult[] = documents.map(doc => ({
      publicacao: doc.metadata,
      score: doc.score,
      match_type: 'semantic' as const
    }));

    console.log(`[SemanticSearch] ✅ Encontrados ${results.length} resultados`);

    return results;
  }
}
