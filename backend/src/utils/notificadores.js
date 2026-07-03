const coreClient = require('../services/coreClient');
const { emitToUser } = require('../websockets/socket');

function criarNotificadorCore(coreRideUuid) {
  return async function notificarCore(status) {
    try {
      await coreClient.atualizarStatusNoCore(coreRideUuid, status);
    } catch (erro) {
      console.warn(`[Notificador:Core] Falha ao notificar Core (${status}) para ${coreRideUuid}:`, erro.message);
    }
  };
}

function criarNotificadorWebsocket({ corridaId, motoristaId, passageiroId }) {
  return async function notificarWebsocket(status, dados = {}) {
    const payload = { tripId: corridaId, status, ...dados };
    if (motoristaId) emitToUser(motoristaId, 'trip_state_changed', payload);
    if (passageiroId) emitToUser(passageiroId, 'trip_state_changed', payload);
  };
}

async function notificarCliente(notificadores, status, dados) {
  await Promise.allSettled(notificadores.map((fn) => fn(status, dados)));
}

module.exports = {
  criarNotificadorCore,
  criarNotificadorWebsocket,
  notificarCliente,
};