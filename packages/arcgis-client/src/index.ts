/**
 * ArcGIS Client Package
 *
 * Exporta cliente e interfaces para comunicação com ArcGIS REST API
 */

export { ArcGISRESTClient } from './arcgis-client.js';
export type { IArcGISClient, QueryFilters, ArcGISHealthStatus } from './arcgis-client.interface.js';

// Query Builders
export { PublicacaoQueryBuilder } from './queries/publicacao.query.js';
export { PublicacaoMunicipalQueryBuilder } from './queries/publicacao-municipal.query.js';
export { DomainQueryBuilder } from './queries/domain.query.js';

// Utilities
export { retryWithBackoff } from './utils/retry.js';
export { paginatedQuery } from './utils/pagination.js';
