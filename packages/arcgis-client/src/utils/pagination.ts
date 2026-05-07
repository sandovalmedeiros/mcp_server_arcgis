/**
 * Pagination Utility
 *
 * Implementa paginação automática para queries FeatureServer
 * (limite de 2000 registros por requisição)
 */

import type { QueryFilters } from '../arcgis-client.interface.js';

const MAX_RECORDS_PER_REQUEST = 2000;

/**
 * Executa query com paginação automática
 */
export async function paginatedQuery<T>(
  queryFn: (filters: QueryFilters) => Promise<T[]>,
  baseFilters: QueryFilters = {}
): Promise<T[]> {
  let allResults: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const results = await queryFn({
      ...baseFilters,
      resultOffset: offset,
      resultRecordCount: MAX_RECORDS_PER_REQUEST
    });

    allResults = [...allResults, ...results];

    // Se retornou menos que o limite, chegamos ao fim
    hasMore = results.length === MAX_RECORDS_PER_REQUEST;
    offset += MAX_RECORDS_PER_REQUEST;
  }

  return allResults;
}
