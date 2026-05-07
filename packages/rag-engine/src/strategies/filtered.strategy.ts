/**
 * Filtered Search Strategy
 *
 * Busca estruturada usando filtros nos campos das publicações
 */

import type { SearchOptions, SearchResult } from '../rag-engine.interface.js';
import type { IArcGISClient } from '@mcp-server/arcgis-client';
import type { FiltrosBusca, Publicacao, PublicacaoMunicipal } from '@mcp-server/shared-types';

export class FilteredSearchStrategy {
  constructor(private arcgisClient: IArcGISClient) {}

  async search(filters: FiltrosBusca): Promise<SearchResult[]> {
    console.log('[FilteredSearch] Buscando com filtros:', JSON.stringify(filters));

    // Constrói cláusula WHERE baseada nos filtros
    const whereClause = this.buildWhereClause(filters);

    // Busca em ambas tabelas
    const [estaduais, municipais] = await Promise.all([
      this.arcgisClient.queryPublicacoes({ where: whereClause }),
      this.arcgisClient.queryPublicacoesMunicipais({ where: whereClause })
    ]);

    // Converte para PublicacaoBase e depois SearchResult
    const results: SearchResult[] = [
      ...estaduais.map(p => this.toSearchResult(p, 'estadual')),
      ...municipais.map(m => this.toSearchResult(m, 'municipal'))
    ];

    console.log(`[FilteredSearch] ✅ Encontrados ${results.length} resultados`);

    return results;
  }

  private buildWhereClause(filters: FiltrosBusca): string {
    const conditions: string[] = [];

    if (filters.temas && filters.temas.length > 0) {
      conditions.push(`id_tema IN (${filters.temas.join(',')})`);
    }

    if (filters.escalas && filters.escalas.length > 0) {
      conditions.push(`codigo_escala IN ('${filters.escalas.join("','")}')`);
    }

    if (filters.anos && filters.anos.length > 0) {
      conditions.push(`codigo_ano IN ('${filters.anos.join("','")}')`);
    }

    if (filters.classes && filters.classes.length > 0) {
      conditions.push(`id_classe_mapa IN (${filters.classes.join(',')})`);
    }

    if (filters.regioes && filters.regioes.length > 0) {
      conditions.push(`id_regiao IN (${filters.regioes.join(',')})`);
    }

    if (filters.municipios && filters.municipios.length > 0) {
      conditions.push(`codmun IN (${filters.municipios.join(',')})`);
    }

    if (filters.possui_pdf !== undefined) {
      // TODO: Implementar após integração com Attachments
      // Por agora ignora este filtro
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }

  private toSearchResult(
    pub: Publicacao | PublicacaoMunicipal,
    tipo: 'estadual' | 'municipal'
  ): SearchResult {
    const isMunicipal = 'codmun' in pub;

    return {
      publicacao: {
        globalid: pub.globalid,
        tipo,
        titulo: isMunicipal ? (pub as any).nommun : pub.titulo,
        tema: isMunicipal ? 'N/A' : (pub as any).id_tema?.toString() || 'N/A',
        escala: isMunicipal ? undefined : (pub as any).codigo_escala,
        ano: (pub as any).codigo_ano || 'N/A',
        possui_pdf: false,
        attachment_count: 0
      } as any,
      score: 1.0,  // Busca filtrada sempre tem score 1.0
      match_type: 'filtered' as const
    };
  }
}
