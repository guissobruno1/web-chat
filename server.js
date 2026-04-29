require('dotenv').config();
const express = require('express');
const http = require('http');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/v1/message', (req, res) => {
  const { session_id, message } = req.body;
  console.log(`[${new Date().toLocaleTimeString()}] session=${session_id} | msg="${message}"`);

  const body = JSON.stringify(req.body);

  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: 8003,
      path: '/v1/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    },
    (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`[${new Date().toLocaleTimeString()}] status=${json.status} | resp="${json.response}"`);
          res.status(proxyRes.statusCode).json(json);
        } catch {
          res.status(proxyRes.statusCode).send(data);
        }
      });
    }
  );

  proxyReq.on('error', (e) => {
    console.error('Erro proxy:', e.message);
    res.status(502).json({ status: 'error', response: 'Erro ao conectar com o serviço.' });
  });

  proxyReq.write(body);
  proxyReq.end();
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
