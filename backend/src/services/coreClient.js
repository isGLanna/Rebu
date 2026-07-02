const axios = require("axios");
const { tick, getCurrentTimestamp } = require("../utils/lamportClock");

// Base URL do Core: http://core:8080/api/v1 (dentro da rede Docker)
// Sobrescrita pela variável de ambiente CORE_URL
const CORE_URL = process.env.CORE_URL || "http://192.168.1.237:8080/api/v1";

// API Key obtida via POST /groups/register — armazenada por variável de ambiente
const CORE_API_KEY = process.env.CORE_API_KEY || "";

// Identificador deste grupo no ecossistema RideFleet
const GROUP_ID = process.env.GROUP_ID || "rebu";

// Cliente HTTP base para o Core
// Autenticação via header X-API-Key (conforme openapi.yaml securitySchemes.ApiKeyAuth)
const coreHttp = axios.create({
  baseURL: CORE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    ...(CORE_API_KEY ? { "X-API-Key": CORE_API_KEY } : {})
  }
});

// Atualiza o clock lógico local com o timestamp retornado pelo Core (regra de Lamport)
function sincronizarClock(responseTimestamp) {
  if (typeof responseTimestamp === "number") {
    tick(responseTimestamp);
  }
}

// Interceptor de resposta: sincroniza relógio de Lamport e loga erros
coreHttp.interceptors.response.use(
  (res) => {
    sincronizarClock(res.data?.logicalTimestamp);
    return res;
  },
  (err) => {
    console.error(
      "[coreClient] Erro na comunicação com o Core:",
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

// ---------------------------------------------------------------------------
// Registro de grupo
// ---------------------------------------------------------------------------

/**
 * Registra (ou re-registra de forma idempotente) este serviço no Core.
 * Deve ser chamado no boot do serviço, antes de qualquer outra operação.
 *
 * Endpoint: POST /groups/register (público — sem X-API-Key)
 * Retorna a API Key que deve ser armazenada em CORE_API_KEY.
 *
 * @param {string} serviceUrl - URL base deste serviço acessível na rede Docker
 *   ex: "http://rebu-backend:3001"
 * @returns {Promise<{groupId, apiKey, registeredAt}>}
 */
async function registrarGrupo(serviceUrl) {
  const resposta = await axios.post(`${CORE_URL}/groups/register`, {
    groupId: GROUP_ID,
    groupName: `Rebu — SIN 142`,
    serviceUrl,
    contactEmail: "rebu@ufv.br"
  });

  return resposta.data;
}

// ---------------------------------------------------------------------------
// Corridas — delegação de saída (este serviço é o ORIGINADOR da corrida)
// ---------------------------------------------------------------------------

/**
 * Cria uma corrida no Core e inicia o leilão com os grupos parceiros.
 * Chamado quando a fila local está congestionada (política de overflow).
 *
 * Endpoint: POST /rides
 * O Core retorna 202 imediatamente; o leilão corre em background.
 * O vencedor é notificado via callback POST /rides/{uuid}/assigned no serviço dele.
 *
 * @param {object} corrida - Dados da corrida local
 * @param {string} corrida.passageiro_id - ID do passageiro
 * @param {string} corrida.origem        - Texto da origem (fallback se sem lat/lng)
 * @param {string} corrida.destino       - Texto do destino
 * @param {number} corrida.origem_lat    - Latitude da origem
 * @param {number} corrida.origem_lng    - Longitude da origem
 * @param {number} corrida.destino_lat   - Latitude do destino
 * @param {number} corrida.destino_lng   - Longitude do destino
 * @returns {Promise<{rideUuid, logicalTimestamp, message}>}
 */
async function criarCorridaNoCore(corrida) {
  const logicalTimestamp = tick();

  const resposta = await coreHttp.post("/rides", {
    originServiceId: GROUP_ID,
    passengerId: corrida.passageiro_id,
    passengerName: corrida.passageiro_nome || "Passageiro",
    origin: {
      lat: corrida.origem_lat || 0,
      lng: corrida.origem_lng || 0,
      street: corrida.origem || ""
    },
    destination: {
      lat: corrida.destino_lat || 0,
      lng: corrida.destino_lng || 0,
      street: corrida.destino || ""
    },
    logicalTimestamp,
    auctionTimeoutSeconds: 10
  });

  return resposta.data; // { rideUuid, logicalTimestamp, message }
}

// ---------------------------------------------------------------------------
// Corridas — atualização de status (este serviço é o VENCEDOR do leilão)
// ---------------------------------------------------------------------------

/**
 * Envia uma transição de estado da saga ao Core.
 * Requer que este serviço detenha o lock distribuído da corrida.
 *
 * Endpoint: PATCH /rides/{rideUuid}/status
 * Transições válidas para grupos: confirm, in_transit, complete, compensating, cancelled
 *
 * @param {string} rideUuid  - UUID da corrida no Core
 * @param {string} novoStatus - Um de: confirm | in_transit | complete | compensating | cancelled
 * @returns {Promise<RideStatus>}
 */
async function atualizarStatusNoCore(rideUuid, novoStatus) {
  const logicalTimestamp = tick();

  const resposta = await coreHttp.patch(`/rides/${rideUuid}/status`, {
    newState: novoStatus,
    serviceId: GROUP_ID,
    logicalTimestamp
  });

  return resposta.data; // RideStatus
}

// ---------------------------------------------------------------------------
// Locks distribuídos
// ---------------------------------------------------------------------------

/**
 * Adquire ou renova o lock distribuído sobre uma corrida.
 * Necessário antes das transições confirm, in_transit e complete.
 * Após vitória no leilão, o lock já vem pré-transferido — use este endpoint para renovar.
 *
 * Endpoint: POST /locks/{rideUuid}
 *
 * @param {string} rideUuid   - UUID da corrida
 * @param {number} ttlSeconds - Validade do lock em segundos (padrão 60)
 * @returns {Promise<{rideUuid, serviceId, expiresAt}>}
 */
async function adquirirLock(rideUuid, ttlSeconds = 60) {
  const resposta = await coreHttp.post(`/locks/${rideUuid}`, {
    serviceId: GROUP_ID,
    ttlSeconds
  });

  return resposta.data; // { rideUuid, serviceId, expiresAt }
}

/**
 * Libera explicitamente o lock distribuído antes de atingir estado terminal.
 * Em complete/cancelled o Core libera automaticamente — não é necessário chamar aqui.
 *
 * Endpoint: DELETE /locks/{rideUuid}
 *
 * @param {string} rideUuid - UUID da corrida
 * @returns {Promise<void>}
 */
async function liberarLock(rideUuid) {
  await coreHttp.delete(`/locks/${rideUuid}`, {
    data: { serviceId: GROUP_ID }
  });
}

// ---------------------------------------------------------------------------
// Consultas (para polling e auditoria)
// ---------------------------------------------------------------------------

/**
 * Consulta o estado atual de uma corrida no Core.
 * Use para polling após POST /rides enquanto aguarda a conclusão do leilão.
 *
 * Endpoint: GET /rides/{rideUuid}/status
 *
 * @param {string} rideUuid - UUID da corrida
 * @returns {Promise<RideStatus>}
 */
async function consultarStatus(rideUuid) {
  const resposta = await coreHttp.get(`/rides/${rideUuid}/status`);
  return resposta.data;
}

/**
 * Consulta o log causal completo da corrida (relógios de Lamport).
 *
 * Endpoint: GET /rides/{rideUuid}/audit
 *
 * @param {string} rideUuid - UUID da corrida
 * @returns {Promise<AuditLog>}
 */
async function consultarAuditLog(rideUuid) {
  const resposta = await coreHttp.get(`/rides/${rideUuid}/audit`);
  return resposta.data;
}

module.exports = {
  registrarGrupo,
  criarCorridaNoCore,
  atualizarStatusNoCore,
  adquirirLock,
  liberarLock,
  consultarStatus,
  consultarAuditLog,
  // Exporta constantes úteis para outros módulos
  GROUP_ID,
  CORE_URL
};
