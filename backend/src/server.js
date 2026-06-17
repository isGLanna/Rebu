require("dotenv").config();
require("./config/db");

const app = require("./app");
const coreClient = require("./services/coreClient");

const PORT = process.env.PORT || 3001;

// URL deste serviço acessível pelo Core na rede Docker
// Deve bater com o container_name configurado no docker-compose
const SERVICE_URL = process.env.SERVICE_URL || `http://rebu-backend:${PORT}`;

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Auto-registro no Core — idempotente, seguro a cada reinício do container.
  // O Core usa o serviceUrl para enviar os webhooks:
  //   POST {serviceUrl}/rides/incoming        (oferta de leilão)
  //   POST {serviceUrl}/rides/{uuid}/assigned (vitória no leilão)
  setTimeout(async () => {
    try {
      const resultado = await coreClient.registrarGrupo(SERVICE_URL);
      console.log(`[server] Grupo registrado no Core:`, resultado);
    } catch (erro) {
      console.warn(`[server] Falha ao registrar grupo no Core (Core pode estar offline):`, erro.message);
    }
  }, 3000); // aguarda 3s para o banco e o Core estarem prontos
});