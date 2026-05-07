/**
 * Domain Query Builder
 *
 * Constrói URLs para queries de domínios (Views do MapServer)
 */

import type { DomainType } from '@mcp-server/shared-types';

export class DomainQueryBuilder {
  constructor(private mapServerUrl: string) {}

  /**
   * Mapeamento de DomainType para Layer IDs do MapServer
   */
  private readonly domainLayers: Record<DomainType, number> = {
    'anos': 4,
    'classes': 5,
    'escalas': 3,
    'temas': 2,
    'tipos_tema': 8,
    'tipos_mapa': 6,
    'tipos_regionalizacao': 10,
    'regioes': 7,
    'municipios': 9
  };

  buildUrl(domainType: DomainType): string {
    const layerId = this.domainLayers[domainType];
    if (layerId === undefined) {
      throw new Error(`Unknown domain type: ${domainType}`);
    }

    const params = new URLSearchParams({
      f: 'json',
      where: '1=1',
      outFields: '*',
      orderByFields: '1'  // Ordenação padrão
    });

    return `${this.mapServerUrl}/${layerId}/query?${params.toString()}`;
  }
}
