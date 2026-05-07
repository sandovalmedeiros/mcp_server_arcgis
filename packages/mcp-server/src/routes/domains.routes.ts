/**
 * Domains Routes
 *
 * Endpoints para obter domínios de busca (temas, escalas, anos, etc.)
 */

import type { FastifyInstance } from 'fastify';
import type { ArcGISRESTClient } from '@mcp-server/arcgis-client';

export async function domainsRoutes(fastify: FastifyInstance): Promise<void> {
  const arcgisClient = fastify.arcgisClient as ArcGISRESTClient;

  /**
   * GET /api/v1/domains/temas
   * Lista todos os temas disponíveis
   */
  fastify.get('/domains/temas', async (request, reply) => {
    try {
      const temas = await arcgisClient.getTemas();
      return reply.send({
        success: true,
        count: temas.length,
        temas
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar temas');
      return reply.status(500).send({
        error: 'Erro ao buscar temas',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/escalas
   * Lista todas as escalas disponíveis
   */
  fastify.get('/domains/escalas', async (request, reply) => {
    try {
      const escalas = await arcgisClient.getEscalas();
      return reply.send({
        success: true,
        count: escalas.length,
        escalas
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar escalas');
      return reply.status(500).send({
        error: 'Erro ao buscar escalas',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/anos
   * Lista todos os anos disponíveis
   */
  fastify.get('/domains/anos', async (request, reply) => {
    try {
      const anos = await arcgisClient.getAnos();
      return reply.send({
        success: true,
        count: anos.length,
        anos
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar anos');
      return reply.status(500).send({
        error: 'Erro ao buscar anos',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/classes
   * Lista todas as classes de mapa disponíveis
   */
  fastify.get('/domains/classes', async (request, reply) => {
    try {
      const classes = await arcgisClient.getClasses();
      return reply.send({
        success: true,
        count: classes.length,
        classes
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar classes');
      return reply.status(500).send({
        error: 'Erro ao buscar classes',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/regioes
   * Lista todas as regiões disponíveis
   */
  fastify.get('/domains/regioes', async (request, reply) => {
    try {
      const regioes = await arcgisClient.getRegioes();
      return reply.send({
        success: true,
        count: regioes.length,
        regioes
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar regiões');
      return reply.status(500).send({
        error: 'Erro ao buscar regiões',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/municipios
   * Lista municípios (com paginação)
   */
  fastify.get('/domains/municipios', async (request, reply) => {
    try {
      const query = request.query as any;
      const limit = parseInt(query.limit || '100', 10);
      const offset = parseInt(query.offset || '0', 10);

      const municipios = await arcgisClient.getMunicipios({
        limit,
        offset
      });

      return reply.send({
        success: true,
        count: municipios.length,
        limit,
        offset,
        municipios
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar municípios');
      return reply.status(500).send({
        error: 'Erro ao buscar municípios',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/domains/all
   * Retorna todos os domínios em uma única requisição
   */
  fastify.get('/domains/all', async (request, reply) => {
    try {
      const [temas, escalas, anos, classes, regioes] = await Promise.all([
        arcgisClient.getTemas(),
        arcgisClient.getEscalas(),
        arcgisClient.getAnos(),
        arcgisClient.getClasses(),
        arcgisClient.getRegioes()
      ]);

      return reply.send({
        success: true,
        domains: {
          temas,
          escalas,
          anos,
          classes,
          regioes
        }
      });
    } catch (error: any) {
      request.log.error(error, '[Domains] Erro ao buscar domínios');
      return reply.status(500).send({
        error: 'Erro ao buscar domínios',
        message: error.message
      });
    }
  });
}
