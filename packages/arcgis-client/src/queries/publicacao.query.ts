/**
 * Publicacao Query Builder
 *
 * Constrói URLs para queries de publicações estaduais/regionais
 */

import type { QueryFilters } from '../arcgis-client.interface.js';

export class PublicacaoQueryBuilder {
  constructor(
    private baseUrl: string,
    private layerId: number
  ) {}

  buildUrl(filters: QueryFilters = {}): string {
    const params = new URLSearchParams({
      f: 'json',
      where: filters.where || '1=1',
      outFields: filters.outFields?.join(',') || '*',
      returnGeometry: (filters.geometry ?? false).toString(),
      resultOffset: filters.resultOffset?.toString() || '0',
      resultRecordCount: filters.resultRecordCount?.toString() || '2000',
      orderByFields: filters.orderByFields?.join(',') || ''
    });

    return `${this.baseUrl}/${this.layerId}/query?${params.toString()}`;
  }
}
