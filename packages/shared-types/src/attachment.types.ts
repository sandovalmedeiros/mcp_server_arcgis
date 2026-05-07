/**
 * Attachment Types - PDFs e Anexos
 *
 * Define interfaces para anexos PDF das publicações
 * através da funcionalidade ESRI Attachments
 */

import { PublicacaoEnriquecida } from './publicacao.types';

/**
 * Attachment de publicação estadual/regional (t_public__at)
 */
export interface Attachment {
  attachmentid: string;
  rel_globalid: string;  // FK para Publicacao.globalid
  content_type: string;
  att_name: string;
  data_size: number;
  data: Buffer;  // Conteúdo binário do PDF
  globalid: string;
}

/**
 * Metadados de attachment sem dados binários
 * Usado para listagens (mais leve)
 */
export interface AttachmentMetadata {
  attachmentid: string;
  rel_globalid: string;
  content_type: string;
  att_name: string;
  data_size: number;
  data_size_formatted: string;
  globalid: string;
  download_url?: string;
}

/**
 * Publicação estadual/regional com seus attachments
 */
export interface PublicacaoComAttachments extends PublicacaoEnriquecida {
  attachments: AttachmentMetadata[];
  total_size_bytes: number;
  total_size_formatted: string;
}

/**
 * Helper para formatar tamanho em bytes para legível
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
