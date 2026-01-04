# API Resources

## API Status Structure

| KEY        | TYPE   | DESCRIPTION                                    |
| ---------- | ------ | ---------------------------------------------- |
| status     | string | Status geral da API (healthy/degraded)        |
| timestamp  | number | Timestamp atual da resposta                    |
| memory     | object | Informações de memória RAM                     |
| cpu        | object | Informações da CPU                             |
| system     | object | Informações do sistema operacional             |
| database   | object | Status da conexão com o banco de dados         |
| statistics | object | Estatísticas gerais (usuários, bots, requests) |
| uptime     | object | Informações de uptime da API                   |

### Memory Object

| KEY           | TYPE   | DESCRIPTION                  |
| ------------- | ------ | ---------------------------- |
| total_mb      | number | Memória RAM total em MB      |
| free_mb       | number | Memória RAM livre em MB      |
| used_mb       | number | Memória RAM usada em MB      |
| usage_percent | number | Percentual de uso de memória |

### CPU Object

| KEY          | TYPE   | DESCRIPTION                    |
| ------------ | ------ | ------------------------------ |
| cores        | number | Número de núcleos da CPU       |
| model        | string | Modelo da CPU                  |
| load_average | object | Carga média da CPU (1/5/15min) |

### System Object

| KEY          | TYPE   | DESCRIPTION                |
| ------------ | ------ | -------------------------- |
| platform     | string | Sistema operacional        |
| arch         | string | Arquitetura do sistema     |
| node_version | string | Versão do Node.js rodando  |

### Database Object

| KEY    | TYPE   | DESCRIPTION                   |
| ------ | ------ | ----------------------------- |
| status | string | Status da conexão (connected) |
| name   | string | Nome do banco de dados        |

### Statistics Object

| KEY           | TYPE   | DESCRIPTION                           |
| ------------- | ------ | ------------------------------------- |
| users         | number | Total de usuários registrados         |
| bots          | number | Total de bots adicionados             |
| request_count | number | Total de requisições desde o startup  |

### Uptime Object

| KEY          | TYPE   | DESCRIPTION                        |
| ------------ | ------ | ---------------------------------- |
| milliseconds | number | Uptime em milissegundos            |
| formatted    | string | Uptime formatado (dias/horas/mins) |
| started_at   | number | Timestamp de quando iniciou        |

### Example Response

```json
{
    "status": "healthy",
    "timestamp": 1704398400000,
    "memory": {
        "total_mb": 8183,
        "free_mb": 2253,
        "used_mb": 5930,
        "usage_percent": 72.47
    },
    "cpu": {
        "cores": 8,
        "model": "Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz",
        "load_average": {
            "1min": 2.15,
            "5min": 1.89,
            "15min": 1.67
        }
    },
    "system": {
        "platform": "linux",
        "arch": "x64",
        "node_version": "v20.10.0"
    },
    "database": {
        "status": "connected",
        "name": "simo_production"
    },
    "statistics": {
        "users": 247,
        "bots": 89,
        "request_count": 15847
    },
    "uptime": {
        "milliseconds": 5591000,
        "formatted": "0d 1h 33m",
        "started_at": 1704392809000
    }
}
```

## Get API Status

### GET `/api/status`

Este método é usado para retornar os status da API, retorna um objeto de [API Status Structure](#api-status-structure).

**Requer Autenticação:** Não

**Rate Limit:** Nenhum

**Resposta:** [API Status Structure](#api-status-structure)