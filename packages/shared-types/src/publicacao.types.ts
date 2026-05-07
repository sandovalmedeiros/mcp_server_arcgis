/**
 * Publicacao Types - Estadual e Regional
 *
 * Define interfaces para publicações cartográficas estaduais e regionais
 * da Mapoteca Digital (tabela t_publicacao no ArcGIS FeatureServer)
 */

/**
 * Tipo de publicação base (campos do FeatureServer)
 */
export interface Publicacao {
  globalid: string;
  id_publicacao: number;
  titulo: string;
  id_classe_mapa: number;
  id_tipo_mapa: number;
  id_tema: number;
  id_tipo_tema: number;
  codigo_escala: string;
  codigo_cor: string;
  id_regiao: number | null;
  id_tipo_regionalizacao: number | null;
  codigo_ano: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Publicação enriquecida com joins de Views do MapServer
 * Inclui nomes descritivos de domínios ao invés de IDs
 */
export interface PublicacaoEnriquecida extends Publicacao {
  // Campos de relacionamento (preenchidos via ArcGIS Views)
  nome_classe_mapa?: string;
  nome_tipo_mapa?: string;
  nome_tema?: string;
  nome_tipo_tema?: string;
  descricao_escala?: string;
  nome_cor?: string;
  nome_regiao?: string;
  nome_tipo_regionalizacao?: string;
  descricao_ano?: string;

  // Metadata do sistema
  attachment_count?: number;
  possui_pdf?: boolean;
  pdf_size_bytes?: number;
}

/**
 * Interface simplificada para exibição em buscas
 * Contém apenas campos essenciais para listagem
 */
export interface PublicacaoResumo {
  globalid: string;
  id_publicacao: number;
  titulo: string;
  nome_tema: string;
  descricao_escala: string;
  codigo_ano: string;
  possui_pdf: boolean;
}

/**
 * Tipo de publicação (estadual, regional ou municipal)
 */
export type TipoPublicacao = 'estadual' | 'regional' | 'municipal';

/**
 * Publicação base unificada para RAG
 * Combina campos de PublicacaoEnriquecida e PublicacaoMunicipalEnriquecida
 */
export interface PublicacaoBase {
  globalid: string;
  tipo: TipoPublicacao;
  titulo: string;
  tema: string;
  escala?: string;
  ano: string;
  possui_pdf: boolean;
  attachment_count: number;
}

/**
 * Union type para qualquer tipo de publicação enriquecida
 */
export type PublicacaoUnion =
  | (PublicacaoEnriquecida & { tipo: 'estadual' | 'regional' })
  | (import('./publicacao-municipal.types').PublicacaoMunicipalEnriquecida & { tipo: 'municipal' });

/**
 * Helper para converter qualquer tipo para PublicacaoBase
 */
export function toPublicacaoBase(pub: PublicacaoUnion): PublicacaoBase {
  if (pub.tipo === 'municipal') {
    return {
      globalid: pub.globalid,
      tipo: pub.tipo,
      titulo: pub.titulo || pub.nommun || 'Sem título',
      tema: pub.tema || 'N/A',
      escala: pub.escala,
      ano: pub.ano || 'N/A',
      possui_pdf: pub.possui_pdf || false,
      attachment_count: pub.attachment_count || 0,
    };
  }

  return {
    globalid: pub.globalid,
    tipo: pub.tipo,
    titulo: pub.titulo,
    tema: pub.nome_tema || 'N/A',
    escala: pub.descricao_escala,
    ano: pub.descricao_ano || pub.codigo_ano,
    possui_pdf: pub.possui_pdf || false,
    attachment_count: pub.attachment_count || 0,
  };
}
