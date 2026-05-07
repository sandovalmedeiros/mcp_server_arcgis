/**
 * Embeddings Service Implementation
 *
 * Gera embeddings locais usando Transformers.js (XLM-RoBERTa)
 * Multilingual support para PT-BR
 */

import { pipeline, env } from '@xenova/transformers';
import type { IEmbeddingsService, ModelInfo } from './embeddings.interface.js';

export class EmbeddingsService implements IEmbeddingsService {
  private generator: any;
  private modelInfo: ModelInfo;
  private initialized = false;

  constructor() {
    this.modelInfo = {
      name: 'XLM-RoBERTa-base',
      dimension: 768,
      language: 'multilingual (PT-BR support)',
      size_mb: 250
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('[EmbeddingsService] Carregando modelo XLM-RoBERTa...');
    console.log('[EmbeddingsService] Isso pode levar ~8 segundos (lazy loading)...');

    // Configura ambiente Transformers.js
    env.allowLocalModels = false;

    // Carrega modelo de sentence embeddings
    this.generator = await pipeline(
      'feature-extraction',
      'Xenova/xlm-roberta-base',
      {
        quantized: true,  // Modelo quantizado (menor, mais rápido)
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`[EmbeddingsService] Downloading: ${progress.progress || 0}%`);
          } else if (progress.status === 'done') {
            console.log('[EmbeddingsService] ✅ Download concluído');
          }
        }
      }
    );

    this.initialized = true;
    console.log('[EmbeddingsService] ✅ Modelo carregado e pronto');
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Gera embedding
    const output = await this.generator(text, {
      pooling: 'mean',
      normalize: true
    });

    // Retorna vetor de 768 dimensões
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<Array<number[]>> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`[EmbeddingsService] Gerando ${texts.length} embeddings em batch...`);

    // Processa em batch (mais eficiente)
    const embeddings = await Promise.all(
      texts.map(text => this.embedText(text))
    );

    console.log(`[EmbeddingsService] ✅ ${embeddings.length} embeddings gerados`);

    return embeddings;
  }

  getModelInfo(): ModelInfo {
    return this.modelInfo;
  }

  getDimension(): number {
    return this.modelInfo.dimension;
  }

  getModelName(): string {
    return this.modelInfo.name;
  }
}
