const express = require("express");
const cors = require("cors");

const usuarioRoutes = require("./routes/usuarioRoutes");
const corridaRoutes = require("./routes/corridaRoutes");
const delegacaoRoutes = require("./routes/delegacaoRoutes");
const leilaoRoutes = require("./routes/leilaoRoutes");
const { healthCheck } = require("./controllers/healthController");

const app = express();

// Permite requisições do front-end
app.use(cors());

// Permite receber JSON no body das requisições
app.use(express.json());

// Rota inicial para testar se a API está funcionando
app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend Rebu rodando!"
  });
});

// Health Check
app.get("/health", healthCheck);

// Rotas de usuários
app.use("/usuarios", usuarioRoutes);

// Rotas de corridas
app.use("/corridas", corridaRoutes);

// Rota de delegação — usada pelo Core para nos enviar corridas (fluxo antigo/manual)
// Todas as mensagens de delegação passam pelo Core, nunca diretamente entre serviços
app.use("/delegacao", delegacaoRoutes);

// Webhooks do Core — endpoints que o Core chama neste serviço durante o leilão:
//   POST /rides/incoming         ← oferta de leilão (todos os grupos)
//   POST /rides/:rideUuid/assigned ← resultado do leilão (somente o vencedor)
// IMPORTANTE: deve ser montado em /rides para coincidir com o serviceUrl registrado no Core
app.use("/rides", leilaoRoutes);

module.exports = app;