/**
 * Attachment Municipal Types - PDFs de Publicações Municipais
 *
 * Define interfaces para anexos PDF de publicações municipais
 * (t_publicacao_munici__at)
 */

import { Attachment } from './attachment.types';
import { PublicacaoMunicipalEnriquecida } from './publicacao-municipal.types';

/**
 * Attachment de publicação municipal
 * Estrutura ligeiramente diferente dos attachments estaduais
 */
export interface AttachmentMunicipal {
  attachmentid: string;
  rel_globalid: string;  // FK para PublicacaoMunicipal.globalid
  content_type: string;
  att_name: string;
  data_size: number;
  data: Buffer;  // Conteúdo binário do PDF
  globalid: string;
  tipo_mapa_mun?: string;  // Campo específico para municipais
}

/**
 * Metadados de attachment municipal sem dados binários
 */
export interface AttachmentMunicipalMetadata {
  attachmentid: string;
  rel_globalid: string;
  content_type: string;
  att_name: string;
  data_size: number;
  data_size_formatted: string;
  globalid: string;
  tipo_mapa_mun?: string;
  download_url?: string;
}

/**
 * Publicação municipal com seus attachments
 */
export interface PublicacaoMunicipalComAttachments extends PublicacaoMunicipalEnriquecida {
  attachments: AttachmentMunicipalMetadata[];
  total_size_bytes: number;
  total_size_formatted: string;
}

/**
 * Union type para qualquer tipo de attachment
 */
export type AttachmentUnion = Attachment | AttachmentMunicipal;

/**
 * Interface base unificada para metadados de attachment
 */
export interface AttachmentMetadataBase {
  attachmentid: string;
  rel_globalid: string;
  content_type: string;
  att_name: string;
  data_size: number;
  data_size_formatted: string;
  globalid: string;
  download_url?: string;
  tipo_mapa_mun?: string;  // Presente apenas para municipais
}

/**
 * Helper para converter qualquer tipo de attachment para formato base
 */
export function toAttachmentMetadata(attachment: AttachmentUnion): AttachmentMetadataBase {
  const { formatBytes } = require('./attachment.types');
  const base: AttachmentMetadataBase = {
    attachmentid: attachment.attachmentid,
    rel_globalid: attachment.rel_globalid,
    content_type: attachment.content_type,
    att_name: attachment.att_name,
    data_size: attachment.data_size,
    data_size_formatted: formatBytes(attachment.data_size),
    globalid: attachment.globalid,
  };

  if ('tipo_mapa_mun' in attachment) {
    base.tipo_mapa_mun = attachment.tipo_mapa_mun;
  }

  return base;
}
