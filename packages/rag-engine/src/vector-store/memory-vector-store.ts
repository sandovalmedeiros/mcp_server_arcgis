/**
 * Memory Vector Store Implementation
 *
 * Armazena embeddings em memória para busca semântica
 * Implementação MVP simples sem dependências externas complexas
 */

import type { IVectorStore, IndexedDocument } from './vector-store.interface.js';
import type { IEmbeddingsService } from '../embeddings/embeddings.interface.js';

export class MemoryVectorStore implements IVectorStore {
  private documents: Map<string, IndexedDocument> = new Map();
  private initialized = false;

  constructor(private embeddingsService: IEmbeddingsService) {}

  async addDocument(publicacao: any, text: string): Promise<void> {
    const id = publicacao.globalid;

    // Gera embedding do texto
    const embedding = await this.embeddingsService.embedText(text);

    const doc: IndexedDocument = {
      id,
      content: text,
      metadata: publicacao,
      embedding
    };

    this.documents.set(id, doc);
  }

  async similaritySearch(
    queryEmbedding: number[],
    k: number
  ): Promise<Array<{ metadata: any; score: number }>> {
    // Calcula similaridade (cosine similarity) com todos os documentos
    const results: Array<{ metadata: any; score: number }> = [];

    for (const [id, doc] of this.documents) {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({
        metadata: doc.metadata,
        score
      });
    }

    // Ordena por score descendente e retorna top-k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  async clear(): Promise<void> {
    this.documents.clear();
    console.log('[MemoryVectorStore] ✅ Índice limpo');
  }

  async count(): Promise<number> {
    return this.documents.size;
  }

  /**
   * Calcula similaridade de cosseno entre dois vetores
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }
}
