# MCP Server

Servidor Fastify que orquestra todos os componentes do MCP Server para Mapoteca Digital.

## Funcionalidades

- 🔍 **Busca Híbrida**: Combina busca semântica (vetorial) com filtros estruturados
- 📊 **Domínios**: Lista temas, escalas, anos, classes, regiões e municípios
- 📄 **Downloads**: Download de PDFs das publicações
- 🏥 **Health Check**: Monitoramento de saúde do servidor e serviços
- 🔐 **Autenticação**: API Key para controle de acesso

## API Endpoints

### Health & Status
- `GET /` - Status do servidor
- `GET /health` - Health check completo
- `GET /ready` - Readiness probe (K8s)

### Busca (RAG)
- `POST /api/v1/query` - Busca híbrida (automática)
- `POST /api/v1/search/semantic` - Busca semântica pura
- `POST /api/v1/search/filtered` - Busca filtrada pura
- `POST /api/v1/search/hybrid` - Busca híbrida explícita

### Domínios
- `GET /api/v1/domains/temas` - Lista temas
- `GET /api/v1/domains/escalas` - Lista escalas
- `GET /api/v1/domains/anos` - Lista anos
- `GET /api/v1/domains/classes` - Lista classes de mapa
- `GET /api/v1/domains/regioes` - Lista regiões
- `GET /api/v1/domains/municipios` - Lista municípios (paginado)
- `GET /api/v1/domains/all` - Todos os domínios em uma requisição

### Publicações
- `GET /api/v1/publicacoes/:globalid` - Detalhes da publicação
- `GET /api/v1/publicacoes/:globalid/attachments` - Lista anexos (PDFs)
- `GET /api/v1/publicacoes/:globalid/pdf` - Download do primeiro PDF
- `GET /api/v1/publicacoes/:globalid/pdf/:attachmentId` - Download de PDF específico

## Autenticação

Todas as requisições (exceto health check) requerem API Key:

**Via Header:**
```
x-api-key: sua-chave-aqui
```

**Via Query Parameter:**
```
?api_key=sua-chave-aqui
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento com watch
npm run dev

# Build
npm run build

# Start produção
npm start
```

## Docker

```bash
# Build imagem
docker build -t mapoteca-mcp-server .

# Run com docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f mcp-server

# Health check
curl http://localhost:3000/health
```

## Variáveis de Ambiente

Veja `.env.example` na raiz do projeto.

## Exemplos de Uso

### Busca Híbrida
```bash
curl -X POST http://localhost:3000/api/v1/query \
  -H "x-api-key: dev-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mapas de Salvador",
    "maxResults": 10,
    "threshold": 0.5
  }'
```

### Busca Filtrada
```bash
curl -X POST http://localhost:3000/api/v1/search/filtered \
  -H "x-api-key: dev-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "temas": [1, 2],
      "anos": ["2023", "2024"]
    }
  }'
```

### Listar Domínios
```bash
curl http://localhost:3000/api/v1/domains/all \
  -H "x-api-key: dev-key-12345"
```

### Download de PDF
```bash
curl http://localhost:3000/api/v1/publicacoes/{globalid}/pdf \
  -H "x-api-key: dev-key-12345" \
  --output mapa.pdf
```
