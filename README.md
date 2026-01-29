<div align="center">

# Simo API

[![Deploy to VPS](https://github.com/ThisPythonJS/SimoAPI/actions/workflows/deploy.yml/badge.svg)](https://github.com/ThisPythonJS/SimoAPI/actions/workflows/deploy.yml)
[![Stars](https://img.shields.io/github/stars/ThisPythonJS/SimoAPI?style=social)](https://github.com/ThisPythonJS/SimoAPI/stargazers)
[![Forks](https://img.shields.io/github/forks/ThisPythonJS/SimoAPI?style=social)](https://github.com/ThisPythonJS/SimoAPI/network/members)
[![Discord](https://img.shields.io/discord/DISCORD_SERVER_ID?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/simo)
[![License](https://img.shields.io/github/license/ThisPythonJS/SimoAPI)](LICENSE)

**Uma API REST moderna e poderosa para serviços relacionados ao ecossistema Simo**  
**Obrigado ao `furstxd4` por criar um pull request.**
[Documentação](https://github.com/ThisPythonJS/SimoAPI) • [Servidor Discord](https://discord.gg/simo) • [Simo Botlist](https://simobotlist.online)

</div>

---

## Índice

- [Sobre](#sobre)
- [Base URL](#base-url)
- [Autenticação](#autenticação)
- [Tipos](#tipos)
- [Datas](#datas)
- [Tratamento de Erros](#tratamento-de-erros)
- [Query String Params](#query-string-params)
- [Locales](#locales-suportados)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)

---

## Sobre

Simo API é uma API baseada em HTTP/REST desenvolvida para fornecer serviços essenciais relacionados ao ecossistema Simo. Construída com foco em performance, segurança e facilidade de uso.

### Características

- Autenticação flexível com suporte para JWT e API Keys
- Suporte para múltiplos idiomas
- Design RESTful seguindo as melhores práticas
- Alta performance com Bun
- Deploy automatizado com Docker

---

## Base URL

```
https://api.simobotlist.online
```

---

## Autenticação

A API suporta dois métodos de autenticação através do header `Authorization`:

### API Key (Recomendado para Bots)

Obtenha sua API key no [Simo Botlist](https://simobotlist.online)

```http
Authorization: Bot 0jija6272bfda-e4jb2bj6bje5c-2icdeg51ee0jb
```

### JSON Web Token (Para Front-end)

```http
Authorization: User eyJhbGciOiJIUzI1NiJ9.UG9yIHF1ZSB2b2PDqiB0ZW50b3UgZGVjb2RpZmljYXIgaXNzbz8.cXaza7vgMrvJR0MXihfaSh7eJUXzsFdmK-b4c_8dEZg
```

### Exemplo de Requisição

```javascript
fetch('https://api.simobotlist.online/api/endpoint', {
  headers: {
    'Authorization': 'Bot YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
```

---

## Tipos

Os tipos seguem o padrão TypeScript para facilitar a integração:

| Campo           | Tipo     | Descrição                                    |
|-----------------|----------|----------------------------------------------|
| `campo_normal`  | `string` | Campo obrigatório                            |
| `opcional?`     | `string` | Campo opcional (pode não estar presente)     |
| `anulavel`      | `?string`| Campo que pode conter `null`                 |

### Exemplo de Estrutura

```typescript
interface User {
  id: string;
  username: string;
  avatar?: string;      // Opcional
  bio: ?string;         // Pode ser null
}
```

---

## Datas

Todas as datas utilizam o formato **ISO 8601** para garantir compatibilidade internacional:

```json
{
  "created_at": "2026-01-08T17:00:00.000Z",
  "updated_at": "2026-01-08T18:30:00.000Z"
}
```

---

## Tratamento de Erros

A API retorna erros estruturados e legíveis. Todos os erros incluem um código único para facilitar o debugging.

### Erro Simples

```json
{
  "message": "Unknown user",
  "code": 5001
}
```

### Erro com Validação

```json
{
  "errors": [
    "Not a well-formed image URL",
    "Username must be between 3 and 32 characters"
  ]
}
```

### Códigos de Status HTTP Comuns

| Código | Significado                    |
|--------|--------------------------------|
| 200    | Sucesso                        |
| 400    | Requisição inválida            |
| 401    | Não autenticado                |
| 403    | Sem permissão                  |
| 404    | Recurso não encontrado         |
| 429    | Rate limit excedido            |
| 500    | Erro interno do servidor       |

Lista completa de erros disponível em `/api/utils/errors.json`

---

## Query String Params

Algumas rotas aceitam parâmetros via query string:

### Valores Booleanos

- `true` ou `1` para verdadeiro
- `false` ou `0` para falso

### Exemplo

```http
GET /api/users?verified=true&limit=10
```

---

## Locales Suportados

| Código  | Idioma                      |
|---------|-----------------------------|
| `pt-BR` | Português (Brasil)          |
| `en-US` | Inglês (Estados Unidos)     |
| `es-ES` | Espanhol (Espanha)          |

### Configurando Locale

```http
Accept-Language: pt-BR
```

---

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commitar suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

## Suporte

Precisa de ajuda? Junte-se à nossa comunidade no Discord:

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-Junte--se%20a%20nós-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/simo)

**[discord.gg/simo](https://discord.gg/simo)**

</div>

---

## Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).

---

<div align="center">

**Feito com ❤️ pela comunidade Simo**

[![GitHub](https://img.shields.io/badge/GitHub-ThisPythonJS-181717?style=flat&logo=github)](https://github.com/ThisPythonJS)

</div>
