const pool = require("../db");

async function pagarCorrida(corridaId, passageiroId, metodo) {
  const corridaResult = await pool.query(
    `SELECT * FROM corridas
     WHERE id = $1 AND passageiro_id = $2 AND status = $3`,
    [corridaId, passageiroId, "finalizada"]
  );

  if (corridaResult.rows.length === 0) {
    return null;
  }

  const corrida = corridaResult.rows[0];

  const pagamentoResult = await pool.query(
    `INSERT INTO pagamentos (corrida_id, passageiro_id, valor, status, metodo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [corridaId, passageiroId, corrida.valor, "pago", metodo]
  );

  return pagamentoResult.rows[0];
}

async function buscarPagamentoPorCorrida(corridaId) {
  const resultado = await pool.query(
    `SELECT * FROM pagamentos
     WHERE corrida_id = $1`,
    [corridaId]
  );

  return resultado.rows[0];
}

module.exports = {
  pagarCorrida,
  buscarPagamentoPorCorrida
};