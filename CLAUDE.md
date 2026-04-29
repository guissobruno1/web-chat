# Contexto de Integração — API Agente de Atendimento LaxeSolutions

## O que é esta API
API REST de atendimento ao cliente com agente de IA. O webchat envia mensagens e recebe respostas do agente.

## Endpoint de produção

```
POST /v1/message
Content-Type: application/json
```

**Request:**
```json
{
  "session_id": "uuid-unico-do-cliente",
  "message": "texto da mensagem"
}
```

**Response:**
```json
{
  "message_id": "uuid-unico-por-mensagem",
  "session_id": "uuid-unico-do-cliente",
  "timestamp": "2026-04-29T13:18:41Z",
  "status": "collecting_info | attending | error",
  "response": "texto da resposta do agente",
  "profile": {
    "name": "Nome do cliente ou null",
    "phone": "Telefone do cliente ou null"
  }
}
```

## Campo `status` — como usar no frontend

| Status | Significado | O que fazer na UI |
|---|---|---|
| `collecting_info` | Agente coletando nome e telefone | Exibir resposta normalmente |
| `attending` | Coleta concluída, atendimento normal | Pode exibir nome do cliente no header |
| `error` | Erro interno | Exibir mensagem de erro amigável |

## Fluxo de conversa

O agente sempre inicia coletando dados antes de atender:

```
1ª mensagem do cliente  →  agente pede o nome
2ª mensagem             →  agente pede o telefone (valida 10-11 dígitos com DDD)
3ª mensagem             →  agente responde e libera o atendimento
Mensagens seguintes     →  atendimento normal
```

**Comportamento especial:** se a primeira mensagem for uma pergunta real (não saudação), o agente responde automaticamente após coletar os dados, sem pedir que o cliente repita.

## Gerenciamento de sessão

- Gerar `session_id` com `crypto.randomUUID()` na primeira visita
- Salvar em `localStorage` para manter a conversa ao recarregar a página
- Usar o mesmo `session_id` em todas as requisições da mesma conversa
- Cada `session_id` mantém histórico e perfil independentes

```javascript
// Exemplo de gerenciamento de sessão
let sessionId = localStorage.getItem('chat_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('chat_session_id', sessionId);
}
```

## Exemplo de requisição em JavaScript

```javascript
async function sendMessage(message) {
  const sessionId = localStorage.getItem('chat_session_id') || crypto.randomUUID();
  localStorage.setItem('chat_session_id', sessionId);

  const response = await fetch('https://api.laxesolutions.cloud/v1/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message })
  });

  const data = await response.json();
  return data; // { message_id, session_id, timestamp, status, response, profile }
}
```

## CORS
A API aceita requisições do domínio do site. Se encontrar erro de CORS, informar o domínio para ser adicionado na configuração da API.

## Endpoint de health check
```
GET /health
Response: { "status": "ok" }
```
Use para verificar se a API está no ar antes de inicializar o chat.
