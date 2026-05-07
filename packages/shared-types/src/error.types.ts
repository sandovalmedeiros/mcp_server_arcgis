/**
 * Error Types - Classes de Erro Customizadas
 *
 * Define tipos de erro e classes para tratamento consistente
 * de erros em todo o sistema MCP Server
 */

/**
 * Interface de erro da API
 */
export interface ApiError {
  error: {
    code: string;           // Ex: "ARCGIS_CONNECTION_ERROR"
    message: string;        // User-friendly message
    details?: any;          // Contexto adicional (development only)
    timestamp: string;      // ISO 8601
    requestId: string;      // UUID da requisição
  };
}

/**
 * Classe base de erro da aplicação
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de conexão com ArcGIS
 */
export class ArcGISConnectionError extends AppError {
  constructor(details?: any) {
    super(
      'ARCGIS_CONNECTION_ERROR',
      'Failed to connect to ArcGIS Server',
      details,
      503
    );
    this.name = 'ArcGISConnectionError';
  }
}

/**
 * Erro de validação de entrada
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de autenticação
 */
export class UnauthorizedError extends AppError {
  constructor(details?: any) {
    super('UNAUTHORIZED', 'Invalid or missing API key', details, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Erro de rate limit
 */
export class RateLimitError extends AppError {
  constructor(details?: any) {
    super('RATE_LIMIT_EXCEEDED', 'Too many requests', details, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Erro do vector store
 */
export class VectorStoreError extends AppError {
  constructor(details?: any) {
    super('VECTOR_STORE_ERROR', 'Vector store operation failed', details, 500);
    this.name = 'VectorStoreError';
  }
}

/**
 * Erro de geração de embeddings
 */
export class EmbeddingError extends AppError {
  constructor(details?: any) {
    super('EMBEDDING_ERROR', 'Failed to generate embeddings', details, 500);
    this.name = 'EmbeddingError';
  }
}

/**
 * Erro de timeout
 */
export class TimeoutError extends AppError {
  constructor(details?: any) {
    super('TIMEOUT_ERROR', 'Operation timed out', details, 504);
    this.name = 'TimeoutError';
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string, details?: any) {
    super('NOT_FOUND', `${resource} not found`, details, 404);
    this.name = 'NotFoundError';
  }
}
