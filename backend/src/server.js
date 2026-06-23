require("dotenv").config();
require("./config/db");

const http = require("http")
const app = require("./app");
const { conectarRedis } = require("./config/redis");
const { initSocket } = require("./websockets/socket")

const PORT = process.env.PORT || 3001;

initSocket(server);

async function registrarNoCore() {
  setTimeout(async () => {
    try {
      const resultado = await coreClient.registrarGrupo(SERVICE_URL);
      console.log(`[server] Grupo registrado no Core:`, resultado);
    } catch (erro) {
      console.warn(`[server] Falha ao registrar grupo no Core (Core pode estar offline):`, erro.message);
    }
  }, 3000);
}

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