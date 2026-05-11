require("dotenv").config();

const express = require("express");
const pool = require("./db");
const redisClient = require("./redisClient");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const usuarioRoutes = require("./routes/usuarioRoutes");
const corridaRoutes = require("./routes/corridaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");

const app = express();

app.use(express.json());

// SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// TESTE DE CONEXÃO COM O BANCO
pool.connect()
  .then(() => console.log("Conectado ao PostgreSQL"))
  .catch((erro) => console.error("Erro ao conectar no PostgreSQL:", erro));

// ROTAS
app.use(usuarioRoutes);
app.use(corridaRoutes);
app.use(pagamentoRoutes);

// ROTA DE TESTE
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mensagem: "Servidor funcionando"
  });
});

const PORT = 3001;

// CONECTAR REDIS
redisClient.connect();

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});