/**
 * Embeddings Service Interface
 *
 * Define contratos para geração de embeddings textuais
 */

export interface IEmbeddingsService {
  initialize(): Promise<void>;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getModelInfo(): ModelInfo;
  getDimension(): number;
  getModelName(): string;
}

/**
 * Metadata do modelo de embeddings
 */
export interface ModelInfo {
  name: string;
  dimension: number;
  language: string;
  size_mb: number;
}
