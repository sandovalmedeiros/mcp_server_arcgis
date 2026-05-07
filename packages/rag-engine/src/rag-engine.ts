/**
 * RAG Engine - Main Implementation
 *
 * Motor de busca híbrida que combina busca vetorial (semantic)
 * com consultas estruturadas (filtered) para máxima relevância
 */

import type {
  IRAGEngine,
  SearchOptions,
  SearchResult,
  SearchStrategy,
  IndexStats
} from './rag-engine.interface.js';
import type { IArcGISClient } from '@mcp-server/arcgis-client';
import type { PublicacaoBase, FiltrosBusca } from '@mcp-server/shared-types';
import { SemanticSearchStrategy } from './strategies/semantic.strategy.js';
import { FilteredSearchStrategy } from './strategies/filtered.strategy.js';
import { HybridSearchStrategy } from './strategies/hybrid.strategy.js';
import { EmbeddingsService } from './embeddings/embeddings.service.js';
import { MemoryVectorStore } from './vector-store/memory-vector-store.js';
import { TextProcessor } from './embeddings/text-processor.service.js';
import type { ITextProcessor } from './embeddings/text-processor.interface.js';

/**
 * Configurações do RAG Engine
 */
interface RAGEngineConfig {
  arcgisClient: IArcGISClient;
  embeddingModel?: string;
  vectorDimension?: number;
}

/**
 * RAG Engine Implementation
 */
export class RAGEngine implements IRAGEngine {
  private semanticStrategy: SemanticSearchStrategy;
  private filteredStrategy: FilteredSearchStrategy;
  private hybridStrategy: HybridSearchStrategy;
  private embeddingsService: EmbeddingsService;
  private vectorStore: MemoryVectorStore;
  private textProcessor: TextProcessor;

  private initialized = false;
  private config: RAGEngineConfig;

  constructor(config: RAGEngineConfig) {
    this.config = config;

    // Inicializa serviços
    this.embeddingsService = new EmbeddingsService();
    this.vectorStore = new MemoryVectorStore(this.embeddingsService);
    this.textProcessor = new TextProcessor() as ITextProcessor;

    // Inicializa estratégias
    this.semanticStrategy = new SemanticSearchStrategy(
      this.vectorStore,
      this.embeddingsService,
      this.textProcessor
    );

    this.filteredStrategy = new FilteredSearchStrategy(this.config.arcgisClient);

    this.hybridStrategy = new HybridSearchStrategy(
      this.semanticStrategy,
      this.filteredStrategy,
      this.textProcessor
    );
  }

  // === Inicialização e Indexação ===

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[RAGEngine] Já inicializado');
      return;
    }

    console.log('[RAGEngine] Inicializando...');

    // Inicializa embeddings (lazy loading)
    await this.embeddingsService.initialize();

    // Carrega publicações do ArcGIS e indexa
    await this.loadAndIndexPublicacoes();

    this.initialized = true;
    console.log('[RAGEngine] ✅ Inicializado e pronto');
  }

  async indexPublicacao(publicacao: PublicacaoBase): Promise<void> {
    const text = this.textProcessor.prepareText(publicacao);
    await this.vectorStore.addDocument(publicacao, text);
  }

  async indexBatch(publicacoes: PublicacaoBase[]): Promise<void> {
    console.log(`[RAGEngine] Indexando lote de ${publicacoes.length} publicações...`);

    // Processa em batches de 100 para não sobrecarregar memória
    const batchSize = 100;
    for (let i = 0; i < publicacoes.length; i += batchSize) {
      const batch = publicacoes.slice(i, i + batchSize);
      await Promise.all(
        batch.map(pub => this.indexPublicacao(pub))
      );
    }

    console.log(`[RAGEngine] ✅ Indexadas ${publicacoes.length} publicações`);
  }

  // === Busca Híbrida ===

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Detecta estratégia automaticamente se não especificada
    const strategy = this.detectStrategy(query, options);

    switch (strategy) {
      case 'semantic':
        return this.semanticSearch(query, options);
      case 'filtered':
        return this.filteredSearch(options.filters || {});
      case 'hybrid':
        return this.hybridSearch(query, options.filters || {}, options);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  async semanticSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    return this.semanticStrategy.search(query, options);
  }

  async filteredSearch(filters: FiltrosBusca): Promise<SearchResult[]> {
    return this.filteredStrategy.search(filters);
  }

  async hybridSearch(
    query: string,
    filters: FiltrosBusca,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    return this.hybridStrategy.search(query, filters, options);
  }

  // === Gerenciamento de Vector Store ===

  async clearIndex(): Promise<void> {
    await this.vectorStore.clear();
    this.initialized = false;
    console.log('[RAGEngine] ✅ Índice limpo');
  }

  async getIndexStats(): Promise<IndexStats> {
    return {
      document_count: await this.vectorStore.count(),
      last_indexed: new Date(),
      vector_dimension: this.embeddingsService.getDimension(),
      model_name: this.embeddingsService.getModelName()
    };
  }

  // === Métodos Privados ===

  private async loadAndIndexPublicacoes(): Promise<void> {
    console.log('[RAGEngine] Carregando publicações do ArcGIS...');

    // Carrega publicações estaduais/regionais
    const publicacoes = await this.config.arcgisClient.queryPublicacoes({
      outFields: ['*']
    });

    // Carrega publicações municipais
    const municipais = await this.config.arcgisClient.queryPublicacoesMunicipais({
      outFields: ['*']
    });

    console.log(`[RAGEngine] Carregadas: ${publicacoes.length} estaduais/regionais + ${municipais.length} municipais`);

    // TODO: Enriquecer com dados das Views do MapServer
    // Por enquanto, converte para PublicacaoBase simples
    const allPublicacoes: PublicacaoBase[] = [
      ...publicacoes.map(p => this.toPublicacaoBase(p, 'estadual')),
      ...municipais.map(m => this.toPublicacaoBase(m, 'municipal'))
    ];

    // Indexa em batch
    await this.indexBatch(allPublicacoes);
  }

  private toPublicacaoBase(
    pub: any,
    tipo: 'estadual' | 'municipal'
  ): PublicacaoBase {
    return {
      globalid: pub.globalid,
      tipo,
      titulo: pub.titulo || pub.nommun || 'Sem título',
      tema: pub.nome_tema || pub.tema || 'N/A',
      escala: pub.descricao_escala || pub.escala,
      ano: pub.descricao_ano || pub.codigo_ano || 'N/A',
      possui_pdf: false,  // TODO: Verificar via attachments
      attachment_count: 0
    };
  }

  private detectStrategy(query: string, options: SearchOptions): SearchStrategy {
    // Se usuário especificou estratégia, usa ela
    // (não implementado ainda, sempre usa hybrid)

    // Auto-detecção baseada na query
    const hasYear = /\b(19|20)\d{2}\b/.test(query);  // Tem ano?
    const hasMunicipioCode = /\b\d{7}\b/.test(query);  // Tem código IBGE?

    if (hasMunicipioCode || hasYear) {
      return 'filtered';  // Busca estruturada é melhor
    }

    return 'hybrid';  // Default: busca híbrida
  }
}
