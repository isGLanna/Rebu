const { redisClient } = require("../config/redis");

async function adicionarNaFilaRedis(nomeFila, corridaId) {
  if (!redisClient.isOpen) {
    console.warn("[REDIS] Cliente não conectado. Fila não espelhada.");
    return;
  }

  await redisClient.rPush(nomeFila, String(corridaId));
}

async function removerDaFilaRedis(nomeFila, corridaId) {
  if (!redisClient.isOpen) {
    console.warn("[REDIS] Cliente não conectado. Item não removido da fila.");
    return;
  }

  await redisClient.lRem(nomeFila, 0, String(corridaId));
}

module.exports = {
  adicionarNaFilaRedis,
  removerDaFilaRedis
};