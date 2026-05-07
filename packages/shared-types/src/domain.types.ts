/**
 * Domain Types - Tabelas de Domínio (Lookup)
 *
 * Define interfaces para tabelas de domínio que fornecem
 * valores padronizados para dropdowns e filtros
 */

/**
 * Ano (t_ano)
 */
export interface Ano {
  codigo_ano: string;
  descricao_ano: string;
}

/**
 * Classe de Mapa (t_classe_mapa)
 */
export interface ClasseMapa {
  id_classe_mapa: number;
  nome_classe: string;
  descricao?: string;
}

/**
 * Escala (t_escala)
 */
export interface Escala {
  codigo_escala: string;
  descricao_escala: string;
  valor_numerico?: number;  // Para ordenação
}

/**
 * Tema (t_tema)
 */
export interface Tema {
  id_tema: number;
  nome_tema: string;
  id_tipo_tema: number;
  ativo?: boolean;
}

/**
 * Tipo de Tema (t_tipo_tema)
 */
export interface TipoTema {
  id_tipo_tema: number;
  nome_tipo: string;
  descricao?: string;
}

/**
 * Região (t_regiao)
 */
export interface Regiao {
  id_regiao: number;
  nome_regiao: string;
  sigla_uf?: string;
}

/**
 * Tipo de Mapa (t_tipo_mapa)
 */
export interface TipoMapa {
  id_tipo_mapa: number;
  nome_tipo: string;
  descricao?: string;
}

/**
 * Tipo de Regionalização (t_tipo_regionalizacao)
 */
export interface TipoRegionalizacao {
  id_tipo_regionalizacao: number;
  nome_tipo: string;
  descricao?: string;
}

/**
 * Município (t_municipio - schema dados_sei)
 */
export interface Municipio {
  codmun: number;
  nommun: string;
  sigla_uf?: string;
  nome_uf?: string;
}

/**
 * Interface genérica para domínio
 */
export interface Dominio<T = any> {
  valor: T;
  descricao: string;
  metadados?: Record<string, any>;
}

/**
 * Tipos de domínio disponíveis
 */
export type DomainType =
  | 'anos'
  | 'classes'
  | 'escalas'
  | 'temas'
  | 'tipos_tema'
  | 'regioes'
  | 'municipios'
  | 'tipos_mapa'
  | 'tipos_regionalizacao';

/**
 * Resposta de domínios em batch
 */
export interface DominiosResponse {
  anos: Ano[];
  classes: ClasseMapa[];
  escalas: Escala[];
  temas: Tema[];
  tipos_tema: TipoTema[];
  regioes: Regiao[];
  municipios?: Municipio[];
  tipos_mapa?: TipoMapa[];
  tipos_regionalizacao?: TipoRegionalizacao[];
  timestamp: Date;
}
