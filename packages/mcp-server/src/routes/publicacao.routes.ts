/**
 * Publicação Routes
 *
 * Endpoints para detalhes e downloads de publicações
 */

import type { FastifyInstance } from 'fastify';
import type { ArcGISRESTClient } from '@mcp-server/arcgis-client';

export async function publicacaoRoutes(fastify: FastifyInstance): Promise<void> {
  const arcgisClient = fastify.arcgisClient as ArcGISRESTClient;

  /**
   * GET /api/v1/publicacoes/:globalid
   * Retorna detalhes de uma publicação específica
   */
  fastify.get('/publicacoes/:globalid', async (request, reply) => {
    const { globalid } = request.params as { globalid: string };

    try {
      // Tenta buscar em estaduais/regionais
      let publicacao = await arcgisClient.getPublicacaoByGlobalIdSafe(globalid, false);

      // Se não encontrou, busca em municipais
      if (!publicacao) {
        publicacao = await arcgisClient.getPublicacaoByGlobalIdSafe(globalid, true);
      }

      if (!publicacao) {
        return reply.status(404).send({
          error: 'Publicação não encontrada',
          globalid
        });
      }

      return reply.send({
        success: true,
        publicacao
      });
    } catch (error: any) {
      request.log.error(error, '[Publicacao] Erro ao buscar publicação');
      return reply.status(500).send({
        error: 'Erro ao buscar publicação',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/publicacoes/:globalid/attachments
   * Lista anexos de uma publicação (PDFs)
   */
  fastify.get('/publicacoes/:globalid/attachments', async (request, reply) => {
    const { globalid } = request.params as { globalid: string };

    try {
      // Tenta buscar em estaduais/regionais
      let attachments = await arcgisClient.getAttachments(globalid, false);

      // Se não encontrou, busca em municipais
      if (!attachments || attachments.length === 0) {
        attachments = await arcgisClient.getAttachments(globalid, true);
      }

      if (!attachments || attachments.length === 0) {
        return reply.status(404).send({
          error: 'Nenhum anexo encontrado',
          globalid
        });
      }

      return reply.send({
        success: true,
        count: attachments.length,
        attachments
      });
    } catch (error: any) {
      request.log.error(error, '[Publicacao] Erro ao buscar anexos');
      return reply.status(500).send({
        error: 'Erro ao buscar anexos',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/publicacoes/:globalid/pdf/:attachmentId
   * Download de PDF específico
   */
  fastify.get('/publicacoes/:globalid/pdf/:attachmentId', async (request, reply) => {
    const { globalid, attachmentId } = request.params as {
      globalid: string;
      attachmentId: string;
    };

    try {
      // Determina se é municipal ou não (heurística simples)
      const isMunicipal = await arcgisClient.isMunicipalGlobalId(globalid);

      // Faz download do PDF
      const pdfBuffer = await arcgisClient.downloadPDF(
        globalid,
        parseInt(attachmentId, 10),
        isMunicipal
      );

      if (!pdfBuffer) {
        return reply.status(404).send({
          error: 'PDF não encontrado',
          globalid,
          attachmentId
        });
      }

      // Retorna o PDF
      reply.type('application/pdf');
      reply.header('Content-Disposition', `attachment; filename="${globalid}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (error: any) {
      request.log.error(error, '[Publicacao] Erro ao fazer download de PDF');
      return reply.status(500).send({
        error: 'Erro ao fazer download de PDF',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/publicacoes/:globalid/pdf
   * Download do primeiro PDF disponível
   */
  fastify.get('/publicacoes/:globalid/pdf', async (request, reply) => {
    const { globalid } = request.params as { globalid: string };

    try {
      // Determina se é municipal
      const isMunicipal = await arcgisClient.isMunicipalGlobalId(globalid);

      // Busca anexos
      const attachments = await arcgisClient.getAttachments(globalid, isMunicipal);

      if (!attachments || attachments.length === 0) {
        return reply.status(404).send({
          error: 'Nenhum PDF encontrado',
          globalid
        });
      }

      // Download do primeiro anexo
      const pdfBuffer = await arcgisClient.downloadPDF(
        globalid,
        attachments[0].id,
        isMunicipal
      );

      if (!pdfBuffer) {
        return reply.status(404).send({
          error: 'PDF não encontrado',
          globalid
        });
      }

      // Retorna o PDF
      reply.type('application/pdf');
      reply.header('Content-Disposition', `attachment; filename="${globalid}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (error: any) {
      request.log.error(error, '[Publicacao] Erro ao fazer download de PDF');
      return reply.status(500).send({
        error: 'Erro ao fazer download de PDF',
        message: error.message
      });
    }
  });
}
