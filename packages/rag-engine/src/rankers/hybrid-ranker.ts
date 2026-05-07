/**
 * Hybrid Ranker
 *
 * Rankeia e mescla resultados de múltiplas estratégias de busca
 */

import type { SearchResult } from '../rag-engine.interface.js';

export class HybridRanker {
  /**
   * Mescla e rankeia resultados de múltiplas fontes
   */
  mergeAndRank(
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

  /**
   * Normaliza scores para 0-1
   */
  normalizeScores(results: SearchResult[]): SearchResult[] {
    if (results.length === 0) return results;

    const maxScore = Math.max(...results.map(r => r.score));

    return results.map(r => ({
      ...r,
      score: maxScore > 0 ? r.score / maxScore : 0
    }));
  }
}
