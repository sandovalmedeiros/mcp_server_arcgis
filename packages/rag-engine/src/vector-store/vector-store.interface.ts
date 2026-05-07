/**
 * Vector Store Interface
 *
 * Define contratos para armazenamento e busca vetorial
 */

export interface IVectorStore {
  // Adicionar documentos
  addDocument(publicacao: any, text: string): Promise<void>;

  // Busca por similaridade
  similaritySearch(queryEmbedding: number[], k: number): Promise<Array<{
    metadata: any;
    score: number;
  }>>;

  // Gerenciamento
  clear(): Promise<void>;
  count(): Promise<number>;
}

/**
 * Documento indexado
 */
export interface IndexedDocument {
  id: string;              // globalid da publicação
  content: string;         // Texto concatenado
  metadata: any;           // PublicacaoBase
  embedding: number[];     // Vetor 768-dimensional
}
