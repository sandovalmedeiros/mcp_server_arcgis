/**
 * Publicacao Municipal Types
 *
 * Define interfaces para publicações cartográficas municipais
 * da Mapoteca Digital (tabela t_publicacao_municipios no ArcGIS FeatureServer)
 */

/**
 * Publicação municipal base (campos do FeatureServer)
 * Estrutura diferente das publicações estaduais/regionais
 */
export interface PublicacaoMunicipal {
  globalid: string;
  id_publicacao_municipio: number;
  codmun: number;  // Código IBGE do município
  coduf: number;   // Código IBGE da UF
  id_classe_mapa: number;
  id_tipo_mapa: number;
  id_metadado_vigente: number | null;
  id_metadado_referencia: number | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Publicação municipal enriquecida com joins de Views
 * Inclui dados do município via t_municipio.dados_sei
 */
export interface PublicacaoMunicipalEnriquecida extends PublicacaoMunicipal {
  // Campos de relacionamento (via t_municipio.dados_sei)
  nommun?: string;  // Nome do município
  nome_uf?: string; // Nome da UF

  // Outros relacionamentos (via Views)
  nome_classe_mapa?: string;
  nome_tipo_mapa?: string;

  // Metadados (se disponível via joins)
  titulo?: string;
  tema?: string;
  escala?: string;
  ano?: string;

  // Metadata do sistema
  attachment_count?: number;
  possui_pdf?: boolean;
  pdf_size_bytes?: number;
}

/**
 * Interface simplificada para exibição em buscas municipais
 */
export interface PublicacaoMunicipalResumo {
  globalid: string;
  id_publicacao_municipio: number;
  nommun: string;
  nome_uf: string;
  titulo?: string;
  tema?: string;
  possui_pdf: boolean;
}

/**
 * Type guard para verificar se publicação é municipal
 */
export function isMunicipal(pub: any): pub is PublicacaoMunicipalEnriquecida {
  return pub && pub.tipo === 'municipal';
}
