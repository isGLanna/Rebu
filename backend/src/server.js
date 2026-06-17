require("dotenv").config();
require("./config/db");

const app = require("./app");
const { conectarRedis } = require("./config/redis");

const PORT = process.env.PORT || 3001;

// Inicializa o servidor
conectarRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error(`[REDIS] Falha ao conectar: ${erro.message}`);

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} sem Redis`);
    });
  });