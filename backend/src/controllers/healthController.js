const pool = require("../config/db");

async function healthCheck(req, res) {
  const inicio = Date.now();

  try {
    const motoristas = await pool.query(
      `SELECT COUNT(*)
       FROM usuarios
       WHERE tipo = 'motorista'
       AND disponivel = TRUE`
    );

    const fila = await pool.query(
      `SELECT COUNT(*)
       FROM fila_corridas`
    );

    const motoristasDisponiveis = Number(motoristas.rows[0].count);
    const tamanhoFila = Number(fila.rows[0].count);

    const latenciaMediaMs = Date.now() - inicio;

    let status = "UP";

    if (tamanhoFila >= 3) {
      console.warn(`[WARN] Fila de corridas elevada: ${tamanhoFila}`);
    }

    if (motoristasDisponiveis === 0) {
      console.warn("[WARN] Nenhum motorista disponível");
    }

    if (tamanhoFila >= 3 || motoristasDisponiveis === 0) {
      status = "DEGRADED";
    }

    return res.json({
      status,
      motoristasDisponiveis,
      tamanhoFila,
      latenciaMediaMs,
      timestamp: new Date().toISOString()
    });

  } catch (erro) {
    console.error(`[ERROR] Falha no health check: ${erro.message}`);

    return res.status(500).json({
      status: "DOWN",
      erro: erro.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  healthCheck
};