const express = require("express");
const cors = require("cors");
const { initScoket } = require("./websockets/socket")

const usuarioRoutes = require("./routes/usuarioRoutes");
const corridaRoutes = require("./routes/corridaRoutes");
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

module.exports = app;