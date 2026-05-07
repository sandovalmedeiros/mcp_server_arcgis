/**
 * Hybrid Search Strategy
 *
 * Combina busca semântica e busca estruturada
 * para máxima relevância nos resultados
 */

import type { SearchOptions, SearchResult } from '../rag-engine.interface.js';
import type { SemanticSearchStrategy } from './semantic.strategy.js';
import type { FilteredSearchStrategy } from './filtered.strategy.js';
import type { ITextProcessor } from '../embeddings/text-processor.interface.js';
import type { FiltrosBusca } from '@mcp-server/shared-types';

export class HybridSearchStrategy {
  constructor(
    private semanticStrategy: SemanticSearchStrategy,
    private filteredStrategy: FilteredSearchStrategy,
    private textProcessor: ITextProcessor
  ) {}

  async search(
    query: string,
    filters: FiltrosBusca,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    console.log(`[HybridSearch] Buscando: "${query}" com filtros`);

    // Executa ambas buscas em paralelo
    const [semanticResults, filteredResults] = await Promise.all([
      this.semanticStrategy.search(query, options),
      this.filteredStrategy.search(filters)
    ]);

    // Mescla e rankeia resultados
    const mergedResults = this.mergeAndRank(
      semanticResults,
      filteredResults,
      query
    );

    // Limita quantidade de resultados
    const maxResults = options.maxResults || 10;
    const finalResults = mergedResults.slice(0, maxResults);

    console.log(`[HybridSearch] ✅ ${finalResults.length} resultados (semantic: ${semanticResults.length}, filtered: ${filteredResults.length})`);

    return finalResults;
  }

  /**
   * Mescla resultados e rankeia por relevância
   */
  private mergeAndRank(
    semanticResults: SearchResult[],
    filteredResults: SearchResult[],
    query: string
  ): SearchResult[] {
    // Remove duplicatas (mesmo globalid)
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of [...semanticResults, ...filteredResults]) {
      const globalid = result.publicacao.globalid;
      if (!seen.has(globalid)) {
        seen.add(globalid);
        unique.push(result);
      }
    }

    // Recalcula scores para resultados híbridos
    return unique.map(result => {
      // Se aparece em ambos, combina scores
      const inSemantic = semanticResults.some(r => r.publicacao.globalid === result.publicacao.globalid);
      const inFiltered = filteredResults.some(r => r.publicacao.globalid === result.publicacao.globalid);

      let finalScore = result.score;

      if (inSemantic && inFiltered) {
        // Boost para resultados que aparecem em ambos
        finalScore = Math.min(0.99, result.score * 1.2);
      } else if (inSemantic) {
        // Pequeno boost para semantic match
        finalScore = Math.min(0.95, result.score * 1.1);
      }

      return {
        ...result,
        score: finalScore,
        match_type: 'hybrid' as const
      };
    })
    .sort((a, b) => b.score - a.score);  // Ordena por score descendente
  }
}
