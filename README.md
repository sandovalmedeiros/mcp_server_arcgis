# MCP Server - Mapoteca Digital

MCP (Model Context Protocol) Server para Mapoteca Digital com implementação de Hybrid RAG (Retrieval-Augmented Generation) para busca inteligente de publicações cartográficas.

## 🎯 Objetivo

Fornecer uma camada de inteligência intermediária entre o Chat Bot da Mapoteca Digital e os serviços ArcGIS Enterprise, permitindo:

- **Busca híbrida** (semantic + structured search)
- **Consulta avançada** com filtros (tema, escala, ano, região)
- **Download de PDFs** via ArcGIS Attachments API
- **Contexto enriquecido** com metadados completos das Views

## 🏗️ Arquitetura

```
mcp-server-mapoteca/
├── packages/
│   ├── mcp-server/         # Servidor Fastify principal
│   ├── arcgis-client/      # Cliente ArcGIS REST API
│   ├── rag-engine/         # Motor RAG híbrido
│   └── shared-types/       # TypeScript types compartilhados
├── docker/                 # Configurações Docker
├── docs/                   # Documentação arquitetural
└── scripts/                # Scripts de build/deploy
```

Documentação completa em: [docs/mcp-server-architecture.md](docs/mcp-server-architecture.md)

## 🚀 Quick Start

```bash
# Clone repositório
git clone https://github.com/sandovalmedeiros/mcp_server_arcgis.git
cd mcp_server_arcgis

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Testes
pnpm test
```

## 📦 Tecnologias

- **Runtime:** Node.js 20+ (TypeScript 5.3+)
- **Framework:** Fastify 4.25+
- **RAG:** LangChain.js + Transformers.js
- **Vector Store:** MemoryVectorStore (MVP)
- **Embeddings:** XLM-RoBERTa (multilingual PT-BR)
- **ArcGIS:** @arcgis/core REST JS 4.28+
- **Testing:** Vitest + Playwright
- **Docker:** Multi-stage build (Alpine)

## 🔌 Endpoints Principais

### Busca Híbrida
```http
POST /api/v1/query
Content-Type: application/json
X-API-Key: sua-api-key

{
  "id": "uuid",
  "timestamp": "2025-11-19T10:00:00Z",
  "query": "Mapas de educação de Salvador",
  "options": {
    "max_results": 10,
    "search_strategy": "hybrid"
  }
}
```

### Domínios
```http
GET /api/v1/domains
X-API-Key: sua-api-key
```

### Health Check
```http
GET /health
```

## 🐳 Docker

```bash
# Build imagem
docker build -t mcp-server:latest -f docker/Dockerfile.mcp-server .

# Subir containers
docker-compose -f docker/docker-compose.yml up -d

# Ver logs
docker-compose -f docker/docker-compose.yml logs -f mcp-server
```

## 📊 Monitoramento

- **Health Check:** `/health` (Portainer interval: 30s)
- **Metrics:** `/metrics` (Prometheus format)
- **Logs:** Pino structured JSON (Portainer logs viewer)

## 🛠️ Desenvolvimento

### Estrutura de Packages

```bash
# Criar novo package
pnpm init <package-name> -w packages/<package-name>

# Adicionar dependência
pnpm --filter <package-name> add <dependency>

# Executar comando em package específico
pnpm --filter <package-name> <command>
```

### Scripts Principais

- `pnpm dev` - Inicia MCP Server em desenvolvimento
- `pnpm build` - Build de todos os packages
- `pnpm test` - Executa todos os testes
- `pnpm lint` - Verifica código style
- `pnpm docker:up` - Sobe containers Docker

## 📝 Licença

MIT - SEIGEO/DIGEO

## 👥 Autores

- **Arquitetura:** Winston (AI Architect Agent)
- **Projeto:** Mapoteca Digital - SEIGEO/DIGEO

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
