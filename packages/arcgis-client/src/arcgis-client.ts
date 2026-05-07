/**
 * ArcGIS REST Client - Main Implementation
 *
 * Cliente principal para comunicação com ArcGIS REST API
 * (FeatureServer e MapServer)
 */

import { request } from 'undici';
import { Readable } from 'stream';
import type { IArcGISClient, QueryFilters, ArcGISHealthStatus } from './arcgis-client.interface.js';
import {
  Publicacao,
  PublicacaoMunicipal,
  PublicacaoEnriquecida,
  PublicacaoMunicipalEnriquecida,
  AttachmentMetadata,
  AttachmentMunicipalMetadata,
  DominiosResponse,
  DomainType
} from '@mcp-server/shared-types';
import { PublicacaoQueryBuilder } from './queries/publicacao.query.js';
import { PublicacaoMunicipalQueryBuilder } from './queries/publicacao-municipal.query.js';
import { DomainQueryBuilder } from './queries/domain.query.js';
import { retryWithBackoff } from './utils/retry.js';

/**
 * Configurações do ArcGIS Client
 */
interface ArcGISClientConfig {
  featureServerUrl: string;
  mapServerUrl: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * ArcGIS REST Client Implementation
 */
export class ArcGISRESTClient implements IArcGISClient {
  private config: ArcGISClientConfig;
  private publicacaoQuery: PublicacaoQueryBuilder;
  private municipalQuery: PublicacaoMunicipalQueryBuilder;
  private domainQuery: DomainQueryBuilder;

  constructor(config: ArcGISClientConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config
    };

    // Inicializa query builders
    this.publicacaoQuery = new PublicacaoQueryBuilder(this.config.featureServerUrl, 0); // Layer 0
    this.municipalQuery = new PublicacaoMunicipalQueryBuilder(this.config.featureServerUrl, 1); // Layer 1
    this.domainQuery = new DomainQueryBuilder(this.config.mapServerUrl);
  }

  // === Consultas a FeatureServer ===

  async queryPublicacoes(filters: QueryFilters = {}): Promise<Publicacao[]> {
    const url = this.publicacaoQuery.buildUrl(filters);
    return this.executeQuery<Publicacao>(url, 't_publicacao');
  }

  async queryPublicacoesMunicipais(filters: QueryFilters = {}): Promise<PublicacaoMunicipal[]> {
    const url = this.municipalQuery.buildUrl(filters);
    return this.executeQuery<PublicacaoMunicipal>(url, 't_publicacao_municipios');
  }

  async getPublicacaoByGlobalId(globalid: string): Promise<Publicacao | null> {
    const url = this.publicacaoQuery.buildUrl({
      where: `globalid='${globalid}'`,
      outFields: ['*']
    });

    const results = await this.executeQuery<Publicacao>(url, 't_publicacao');
    return results[0] || null;
  }

  async getPublicacaoMunicipalByGlobalId(globalid: string): Promise<PublicacaoMunicipal | null> {
    const url = this.municipalQuery.buildUrl({
      where: `globalid='${globalid}'`,
      outFields: ['*']
    });

    const results = await this.executeQuery<PublicacaoMunicipal>(url, 't_publicacao_municipios');
    return results[0] || null;
  }

  // === Consultas a MapServer (Views/Domínios) ===

  async getDomains(domainType: DomainType): Promise<any[]> {
    const url = this.domainQuery.buildUrl(domainType);
    return this.executeQuery<any>(url, `domains_${domainType}`);
  }

  async getAllDomains(): Promise<DominiosResponse> {
    const domainTypes: DomainType[] = [
      'anos', 'classes', 'escalas', 'temas', 'tipos_tema', 'regioes', 'municipios'
    ];

    const domains = await Promise.all(
      domainTypes.map(type => this.getDomains(type))
    );

    return {
      anos: domains[0],
      classes: domains[1],
      escalas: domains[2],
      temas: domains[3],
      tipos_tema: domains[4],
      regioes: domains[5],
      municipios: domains[6],
      timestamp: new Date()
    };
  }

  async getEnrichedPublicacao(globalid: string): Promise<PublicacaoEnriquecida> {
    // Primeiro busca dados base
    const pub = await this.getPublicacaoByGlobalId(globalid);
    if (!pub) {
      throw new Error(`Publicação não encontrada: ${globalid}`);
    }

    // TODO: Consultar View enriquecida do MapServer
    // Por enquanto retorna dados base
    return {
      ...pub,
      attachment_count: 0,
      possui_pdf: false
    };
  }

  async getEnrichedPublicacaoMunicipal(globalid: string): Promise<PublicacaoMunicipalEnriquecida> {
    // Primeiro busca dados base
    const pub = await this.getPublicacaoMunicipalByGlobalId(globalid);
    if (!pub) {
      throw new Error(`Publicação municipal não encontrada: ${globalid}`);
    }

    // TODO: Consultar View enriquecida do MapServer
    // Por enquanto retorna dados base
    return {
      ...pub,
      attachment_count: 0,
      possui_pdf: false
    };
  }

  // === Attachments ===

  async listAttachments(globalid: string): Promise<AttachmentMetadata[]> {
    // Primeiro precisa obter objectId
    const pub = await this.getPublicacaoByGlobalId(globalid);
    if (!pub) {
      return [];
    }

    // Obter objectId (necessário para Attachments API)
    const objectIdUrl = this.publicacaoQuery.buildUrl({
      where: `globalid='${globalid}'`,
      outFields: ['objectid']
    });

    const results = await this.executeQuery<any>(objectIdUrl, 't_publicacao');
    if (results.length === 0) {
      return [];
    }

    const objectId = results[0].objectid;

    // Listar attachments
    const url = `${this.config.featureServerUrl}/0/${objectId}/attachments?f=json`;
    const response = await this.executeRequest<{ attachmentInfos: any[] }>(url);

    return (response.attachmentInfos || []).map(att => ({
      attachmentid: att.id,
      rel_globalid: globalid,
      content_type: att.contentType,
      att_name: att.name,
      data_size: att.size,
      data_size_formatted: this.formatBytes(att.size),
      globalid: att.parentGlobalId,
      download_url: `${this.config.featureServerUrl}/0/${objectId}/attachments/${att.id}`
    }));
  }

  async listAttachmentsMunicipais(globalid: string): Promise<AttachmentMunicipalMetadata[]> {
    // Mesmo fluxo que listAttachments, mas para layer 1
    const pub = await this.getPublicacaoMunicipalByGlobalId(globalid);
    if (!pub) {
      return [];
    }

    const objectIdUrl = this.municipalQuery.buildUrl({
      where: `globalid='${globalid}'`,
      outFields: ['objectid']
    });

    const results = await this.executeQuery<any>(objectIdUrl, 't_publicacao_municipios');
    if (results.length === 0) {
      return [];
    }

    const objectId = results[0].objectid;

    const url = `${this.config.featureServerUrl}/1/${objectId}/attachments?f=json`;
    const response = await this.executeRequest<{ attachmentInfos: any[] }>(url);

    return (response.attachmentInfos || []).map(att => ({
      attachmentid: att.id,
      rel_globalid: globalid,
      content_type: att.contentType,
      att_name: att.name,
      data_size: att.size,
      data_size_formatted: this.formatBytes(att.size),
      globalid: att.parentGlobalId,
      tipo_mapa_mun: att.tipo_mapa_mun,
      download_url: `${this.config.featureServerUrl}/1/${objectId}/attachments/${att.id}`
    }));
  }

  async downloadAttachment(attachmentId: string, objectId: number, layer: number): Promise<Readable> {
    const url = `${this.config.featureServerUrl}/${layer}/${objectId}/attachments/${attachmentId}`;

    // TODO: Implementar streaming download
    // Por hora retorna URL para download direto
    throw new Error('Download streaming não implementado ainda. Use download_url direto.');
  }

  // === Health Check ===

  async healthCheck(): Promise<ArcGISHealthStatus> {
    const startTime = Date.now();

    try {
      // Query simples para testar conectividade
      const url = `${this.config.featureServerUrl}/0/query?where=1%3D0&returnCountOnly=true&f=json`;
      await this.executeRequest<any>(url);

      return {
        status: 'healthy',
        latency_ms: Date.now() - startTime,
        featureServerUrl: this.config.featureServerUrl,
        mapServerUrl: this.config.mapServerUrl
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency_ms: Date.now() - startTime,
        featureServerUrl: this.config.featureServerUrl,
        mapServerUrl: this.config.mapServerUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === Getters ===

  getFeatureServerUrl(): string {
    return this.config.featureServerUrl;
  }

  getMapServerUrl(): string {
    return this.config.mapServerUrl;
  }

  // === Métodos Privados ===

  private async executeQuery<T>(url: string, context: string): Promise<T[]> {
    const response = await retryWithBackoff(
      () => this.executeRequest<{ features?: any[]; fields?: any[] }>(url),
      this.config.maxRetries || 3,
      context
    );

    // ArcGIS retorna dados em diferentes formatos
    if (response.features) {
      return response.features.map(f => this.convertDates(f.attributes));
    }

    if (Array.isArray(response)) {
      return response.map(item => this.convertDates(item));
    }

    return [];
  }

  private async executeRequest<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await request(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        throwOnError: false
      } as any);

      clearTimeout(timeoutId);

      if (response.statusCode !== 200) {
        throw new Error(`ArcGIS API returned ${response.statusCode}: ${response.statusCode}`);
      }

      const body = await response.body.json() as T;
      return body;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  private convertDates(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Converte strings de data para Date objects
        if (
          (key === 'created_at' || key === 'updated_at') &&
          typeof obj[key] === 'string' &&
          !isNaN(Date.parse(obj[key]))
        ) {
          converted[key] = new Date(obj[key]);
        } else {
          converted[key] = obj[key];
        }
      }
    }
    return converted;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
