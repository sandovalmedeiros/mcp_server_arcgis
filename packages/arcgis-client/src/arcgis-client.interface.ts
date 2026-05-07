/**
 * ArcGIS Client Interface
 *
 * Define contratos para comunicação com ArcGIS REST API
 * (FeatureServer e MapServer)
 */

import { Publicacao, PublicacaoEnriquecida, PublicacaoMunicipal, PublicacaoMunicipalEnriquecida } from '@mcp-server/shared-types';
import { AttachmentMetadata, AttachmentMunicipalMetadata } from '@mcp-server/shared-types';
import { Ano, ClasseMapa, Escala, Tema, TipoTema, Regiao, Municipio, DominiosResponse, DomainType } from '@mcp-server/shared-types';
import { Readable } from 'stream';

/**
 * Filtros para queries do FeatureServer
 */
export interface QueryFilters {
  where?: string;
  outFields?: string[];
  geometry?: boolean;
  returnGeometry?: boolean;
  resultOffset?: number;
  resultRecordCount?: number;
  orderByFields?: string[];
}

/**
 * Health check status
 */
export interface ArcGISHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency_ms?: number;
  featureServerUrl?: string;
  mapServerUrl?: string;
  error?: string;
}

/**
 * Interface principal do ArcGIS Client
 */
export interface IArcGISClient {
  // Consultas a FeatureServer (duas tabelas)
  queryPublicacoes(filters: QueryFilters): Promise<Publicacao[]>;
  queryPublicacoesMunicipais(filters: QueryFilters): Promise<PublicacaoMunicipal[]>;
  getPublicacaoByGlobalId(globalid: string): Promise<Publicacao | null>;
  getPublicacaoMunicipalByGlobalId(globalid: string): Promise<PublicacaoMunicipal | null>;

  // Consultas a MapServer (Views/Domínios)
  getDomains(domainType: DomainType): Promise<any[]>;
  getAllDomains(): Promise<DominiosResponse>;
  getEnrichedPublicacao(globalid: string): Promise<PublicacaoEnriquecida>;
  getEnrichedPublicacaoMunicipal(globalid: string): Promise<PublicacaoMunicipalEnriquecida>;

  // Attachments (duas tabelas)
  listAttachments(globalid: string): Promise<AttachmentMetadata[]>;
  listAttachmentsMunicipais(globalid: string): Promise<AttachmentMunicipalMetadata[]>;
  downloadAttachment(attachmentId: string, objectId: number, layer: number): Promise<Readable>;

  // Health check
  healthCheck(): Promise<ArcGISHealthStatus>;

  // Configurações
  getFeatureServerUrl(): string;
  getMapServerUrl(): string;
}
