/**
 * RAG Engine Package
 *
 * Exporta motor de busca híbrida com embeddings locais
 */

export { RAGEngine } from './rag-engine.js';
export type { IRAGEngine, SearchOptions, SearchResult, SearchStrategy, IndexStats } from './rag-engine.interface.js';

// Strategies
export { SemanticSearchStrategy } from './strategies/semantic.strategy.js';
export { FilteredSearchStrategy } from './strategies/filtered.strategy.js';
export { HybridSearchStrategy } from './strategies/hybrid.strategy.js';

// Embeddings
export { EmbeddingsService } from './embeddings/embeddings.service.js';
export type { IEmbeddingsService, ModelInfo } from './embeddings/embeddings.interface.js';
export { TextProcessor } from './embeddings/text-processor.service.js';
export type { ITextProcessor } from './embeddings/text-processor.interface.js';

// Vector Store
export { MemoryVectorStore } from './vector-store/memory-vector-store.js';
export type { IVectorStore, IndexedDocument } from './vector-store/vector-store.interface.js';

// Rankers
export { HybridRanker } from './rankers/hybrid-ranker.js';
