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

    const filaLocal = await pool.query(
      `SELECT COUNT(*)
       FROM fila_corridas`
    );

    const filaEntrada = await pool.query(
      `SELECT COUNT(*)
       FROM fila_entrada_corridas`
    );

    const filaSaida = await pool.query(
      `SELECT COUNT(*)
       FROM fila_saida_corridas`
    );

    const motoristasDisponiveis = Number(motoristas.rows[0].count);
    const tamanhoFilaLocal = Number(filaLocal.rows[0].count);
    const tamanhoFilaEntrada = Number(filaEntrada.rows[0].count);
    const tamanhoFilaSaida = Number(filaSaida.rows[0].count);

    const tamanhoFilaTotal =
      tamanhoFilaLocal + tamanhoFilaEntrada + tamanhoFilaSaida;

    const latenciaMediaMs = Date.now() - inicio;

    let status = "UP";

    if (tamanhoFilaTotal >= 3) {
      console.warn(`[WARN] Fila de corridas elevada: ${tamanhoFilaTotal}`);
    }

    if (motoristasDisponiveis === 0) {
      console.warn("[WARN] Nenhum motorista disponível");
    }

    if (tamanhoFilaTotal >= 3 || motoristasDisponiveis === 0) {
      status = "DEGRADED";
    }

    return res.json({
      status,
      motoristasDisponiveis,
      filas: {
        local: tamanhoFilaLocal,
        entrada: tamanhoFilaEntrada,
        saida: tamanhoFilaSaida,
        total: tamanhoFilaTotal
      },
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