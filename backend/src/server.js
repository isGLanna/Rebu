require("dotenv").config();
require("./config/db");

const http = require("http")
const app = require("./app");
const { conectarRedis } = require("./config/redis");
const { initSocket } = require("./websockets/socket")

const PORT = process.env.PORT || 3001;

// Inicializa o servidor
conectarRedis()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error(`[REDIS] Falha ao conectar: ${erro.message}`);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT} sem Redis`);
    });
  });