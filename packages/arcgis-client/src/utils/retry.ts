/**
 * Retry Utility
 *
 * Implementa retry com exponential backoff para requisições ArcGIS
 */

/**
 * Executa função com retry e exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  context: string
): Promise<T> {
  let lastError: Error = new Error('Unknown error in retry');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Se é o último retry ou erro não é recuperável, lança
      if (attempt === maxRetries || !isRecoverableError(error)) {
        throw error;
      }

      // Exponential backoff: 2^attempt * 100ms
      const delay = Math.pow(2, attempt) * 100;
      console.warn(`[${context}] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Verifica se erro é recuperável (deve tentar novamente)
 */
function isRecoverableError(error: any): boolean {
  // Erros de rede/temporários
  if (error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN') {
    return true;
  }

  // Erros HTTP 5xx (server errors)
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  // Erro 429 (rate limit)
  if (error.statusCode === 429) {
    return true;
  }

  return false;
}

/**
 * Sleep por ms milissegundos
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
