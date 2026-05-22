const pool = require("../db");
const routeService = require("./routeService");
const redisClient = require("../redisClient");

async function criarCorrida(passageiroId, origem, destino) {
  const rota = await routeService.calcularRota(origem, destino);
  const valor = routeService.calcularValor(rota.distanciaKm);

  const origemFormatada = routeService.formatarLocalizacao(origem);
  const destinoFormatado = routeService.formatarLocalizacao(destino);

  const resultado = await pool.query(
    `INSERT INTO corridas 
      (passageiro_id, origem, destino, status, valor, distancia_km, duracao_min)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      passageiroId,
      JSON.stringify(origemFormatada),
      JSON.stringify(destinoFormatado),
      "pendente",
      valor,
      rota.distanciaKm,
      rota.duracaoMin
    ]
  );

  const corrida = resultado.rows[0];

  if (corrida) {
    corrida.origem = JSON.parse(corrida.origem);
    corrida.destino = JSON.parse(corrida.destino);
    corrida.geometry = rota.geometry;
  }

  await redisClient.set(`corrida:${corrida.id}`, JSON.stringify(corrida));
  await redisClient.sAdd("corridas_pendentes", String(corrida.id));

  return corrida;
}

async function aceitarCorrida(corridaId, motoristaId) {
  const lockKey = `lock_corrida:${corridaId}`;

  const lockCriado = await redisClient.set(lockKey, String(motoristaId), {
    NX: true,
    EX: 30
  });

  if (!lockCriado) {
    return {
      erro: "Corrida já está sendo disputada por outro motorista"
    };
  }

  const resultado = await pool.query(
    `UPDATE corridas
     SET motorista_id = $1, status = $2
     WHERE id = $3 AND status = $4
     RETURNING *`,
    [motoristaId, "aceita", corridaId, "pendente"]
  );

  const corrida = resultado.rows[0];

  if (!corrida) {
    await redisClient.del(lockKey);
    return null;
  }

  await redisClient.del(`corrida:${corridaId}`);
  await redisClient.sRem("corridas_pendentes", String(corridaId));

  return corrida;
}

async function finalizarCorrida(corridaId, motoristaId) {
  const resultado = await pool.query(
    `UPDATE corridas
     SET status = $1
     WHERE id = $2 AND motorista_id = $3 AND status = $4
     RETURNING *`,
    ["finalizada", corridaId, motoristaId, "aceita"]
  );

  return resultado.rows[0];
}

async function buscarCorridaPorId(corridaId) {
  const resultado = await pool.query(
    `SELECT 
      c.id,
      c.passageiro_id,
      c.motorista_id,
      c.origem,
      c.destino,
      c.status,
      c.valor,
      c.distancia_km,
      c.duracao_min,
      c.data_hora,
      u.nome AS motorista_nome,
      u.email AS motorista_email
     FROM corridas c
     LEFT JOIN usuarios u ON c.motorista_id = u.id
     WHERE c.id = $1`,
    [corridaId]
  );

  return resultado.rows[0];
}

async function listarMinhasCorridas(passageiroId) {
  const resultado = await pool.query(
    `SELECT * FROM corridas
     WHERE passageiro_id = $1
     ORDER BY data_hora DESC`,
    [passageiroId]
  );

  return resultado.rows;
}

async function listarCorridasPendentes() {
  const ids = await redisClient.sMembers("corridas_pendentes");

  const corridas = [];

  for (const id of ids) {
    const corridaJson = await redisClient.get(`corrida:${id}`);

    if (corridaJson) {
      corridas.push(JSON.parse(corridaJson));
    }
  }

  return corridas;
}

module.exports = {
  criarCorrida,
  aceitarCorrida,
  finalizarCorrida,
  buscarCorridaPorId,
  listarMinhasCorridas,
  listarCorridasPendentes
};