const estados = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN"
};

const circuitos = {};

const FAILURE_THRESHOLD = Number(process.env.CB_FAILURE_THRESHOLD || 3);
const RECOVERY_TIMEOUT_MS = Number(process.env.CB_RECOVERY_TIMEOUT_MS || 30000);

function criarCircuito(serviceId) {
  if (!circuitos[serviceId]) {
    circuitos[serviceId] = {
      serviceId,
      state: estados.CLOSED,
      failureCount: 0,
      lastFailureAt: null,
      openedAt: null
    };
  }

  return circuitos[serviceId];
}

function getCircuitState(serviceId) {
  const circuito = criarCircuito(serviceId);

  if (
    circuito.state === estados.OPEN &&
    circuito.openedAt &&
    Date.now() - circuito.openedAt >= RECOVERY_TIMEOUT_MS
  ) {
    circuito.state = estados.HALF_OPEN;
  }

  return circuito;
}

function canCall(serviceId) {
  const circuito = getCircuitState(serviceId);
  return circuito.state !== estados.OPEN;
}

function recordSuccess(serviceId) {
  const circuito = criarCircuito(serviceId);

  circuito.state = estados.CLOSED;
  circuito.failureCount = 0;
  circuito.lastFailureAt = null;
  circuito.openedAt = null;

  return circuito;
}

function recordFailure(serviceId) {
  const circuito = criarCircuito(serviceId);

  circuito.failureCount += 1;
  circuito.lastFailureAt = new Date().toISOString();

  if (circuito.failureCount >= FAILURE_THRESHOLD) {
    circuito.state = estados.OPEN;
    circuito.openedAt = Date.now();
  }

  return circuito;
}

function getAllCircuits() {
  Object.keys(circuitos).forEach(getCircuitState);
  return Object.values(circuitos);
}

module.exports = {
  estados,
  canCall,
  recordSuccess,
  recordFailure,
  getCircuitState,
  getAllCircuits
};