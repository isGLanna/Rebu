const pool = require("../config/db");
const { buscarRota } = require("../services/routeService");
const { registrarEvento } = require("../utils/auditLogger");

const LIMITE_FILA = 3;

async function solicitarCorrida(req, res) {
  const { passageiro_id } = req.params;

  const {
    origem,
    destino,
    origem_lat,
    origem_lng,
    destino_lat,
    destino_lng
  } = req.body;

  const temTexto = origem && destino;

  const temCoordenadas =
    origem_lat !== undefined &&
    origem_lng !== undefined &&
    destino_lat !== undefined &&
    destino_lng !== undefined;

  if (!passageiro_id || (!temTexto && !temCoordenadas)) {
    return res.status(400).json({
      erro: "Informe origem/destino em texto ou coordenadas completas."
    });
  }

  try {
    const passageiro = await pool.query(
      `SELECT * FROM usuarios
       WHERE id = $1 AND tipo = 'passageiro'`,
      [passageiro_id]
    );

    if (passageiro.rows.length === 0) {
      return res.status(404).json({
        erro: "Passageiro não encontrado."
      });
    }

    const origemFinal = origem || `${origem_lat},${origem_lng}`;
    const destinoFinal = destino || `${destino_lat},${destino_lng}`;

    let rotaCoordenadas = null;

    if (temCoordenadas) {
      rotaCoordenadas = await buscarRota(
        {
          latitude: origem_lat,
          longitude: origem_lng
        },
        {
          latitude: destino_lat,
          longitude: destino_lng
        }
      );
    }

    const fila = await pool.query(
      `SELECT COUNT(*) FROM fila_corridas`
    );

    const quantidadeNaFila = Number(fila.rows[0].count);
    const servicoCongestionado = quantidadeNaFila >= LIMITE_FILA;

    if (servicoCongestionado) {
      const corridaPendente = await pool.query(
        `INSERT INTO corridas (
          passageiro_id,
          origem,
          destino,
          origem_lat,
          origem_lng,
          destino_lat,
          destino_lng,
          status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [
          passageiro_id,
          origemFinal,
          destinoFinal,
          origem_lat || null,
          origem_lng || null,
          destino_lat || null,
          destino_lng || null,
          "request"
        ]
      );

      await pool.query(
        `INSERT INTO fila_corridas (corrida_id, motivo)
         VALUES ($1, $2)`,
        [
          corridaPendente.rows[0].id,
          "Serviço congestionado: fila local atingiu o limite"
        ]
      );

      await registrarEvento(
        corridaPendente.rows[0].id,
        "ride_queued",
        {
          estadoAnterior: null,
          estadoNovo: "request",
          motivo: "Serviço congestionado: fila local atingiu o limite"
        },
        "WARN"
      );

      return res.status(201).json({
        mensagem: "Serviço congestionado. Corrida enviada para fila local.",
        politica_overflow: `fila_corridas >= ${LIMITE_FILA}`,
        corrida: corridaPendente.rows[0],
        rota: rotaCoordenadas
      });
    }

    const motoristaDisponivel = await pool.query(
      `SELECT * FROM usuarios
       WHERE tipo = 'motorista'
       AND disponivel = TRUE
       LIMIT 1`
    );

    if (motoristaDisponivel.rows.length > 0) {
      const motoristaId = motoristaDisponivel.rows[0].id;

      await pool.query(
        `UPDATE usuarios
         SET disponivel = FALSE
         WHERE id = $1`,
        [motoristaId]
      );

      const corrida = await pool.query(
        `INSERT INTO corridas (
          passageiro_id,
          motorista_id,
          origem,
          destino,
          origem_lat,
          origem_lng,
          destino_lat,
          destino_lng,
          status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [
          passageiro_id,
          motoristaId,
          origemFinal,
          destinoFinal,
          origem_lat || null,
          origem_lng || null,
          destino_lat || null,
          destino_lng || null,
          "match"
        ]
      );

      await registrarEvento(
        corrida.rows[0].id,
        "ride_matched",
        {
          estadoAnterior: "request",
          estadoNovo: "match",
          motoristaId
        }
      );

      return res.status(201).json({
        mensagem: "Corrida criada com motorista atribuído.",
        corrida: corrida.rows[0],
        rota: rotaCoordenadas
      });
    }

    const corridaPendente = await pool.query(
      `INSERT INTO corridas (
        passageiro_id,
        origem,
        destino,
        origem_lat,
        origem_lng,
        destino_lat,
        destino_lng,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        passageiro_id,
        origemFinal,
        destinoFinal,
        origem_lat || null,
        origem_lng || null,
        destino_lat || null,
        destino_lng || null,
        "request"
      ]
    );

    await pool.query(
      `INSERT INTO fila_corridas (corrida_id, motivo)
       VALUES ($1, $2)`,
      [
        corridaPendente.rows[0].id,
        "Sem motoristas disponíveis"
      ]
    );

    await registrarEvento(
      corridaPendente.rows[0].id,
      "ride_queued",
      {
        estadoAnterior: null,
        estadoNovo: "request",
        motivo: "Sem motoristas disponíveis"
      },
      "WARN"
    );

    return res.status(201).json({
      mensagem: "Nenhum motorista disponível. Corrida enviada para fila.",
      corrida: corridaPendente.rows[0],
      rota: rotaCoordenadas
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao solicitar corrida."
    });
  }
}

async function listarCorridas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM corridas ORDER BY id`
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao listar corridas."
    });
  }
}

async function buscarCorridaPorId(req, res) {
  const { corrida_id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT * FROM corridas WHERE id = $1`,
      [corrida_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Corrida não encontrada."
      });
    }

    return res.json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao buscar corrida."
    });
  }
}

async function atualizarStatusCorrida(req, res, statusAtualEsperado, novoStatus) {
  const { corrida_id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT * FROM corridas WHERE id = $1`,
      [corrida_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Corrida não encontrada."
      });
    }

    const corrida = resultado.rows[0];

    if (corrida.status !== statusAtualEsperado) {
      return res.status(400).json({
        erro: "Transição inválida.",
        status_atual: corrida.status
      });
    }

    const atualizada = await pool.query(
      `UPDATE corridas
       SET status = $1,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [novoStatus, corrida_id]
    );

    await registrarEvento(
      corrida_id,
      `ride_${novoStatus}`,
      {
        estadoAnterior: statusAtualEsperado,
        estadoNovo: novoStatus
      }
    );

    return res.json({
      mensagem: `Status alterado para ${novoStatus}.`,
      corrida: atualizada.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao atualizar corrida."
    });
  }
}

async function confirmarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "match", "confirm");
}

async function iniciarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "confirm", "in_transit");
}

async function finalizarCorrida(req, res) {
  const { corrida_id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT * FROM corridas WHERE id = $1`,
      [corrida_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Corrida não encontrada."
      });
    }

    const corrida = resultado.rows[0];

    if (corrida.status !== "in_transit") {
      return res.status(400).json({
        erro: "Transição inválida.",
        status_atual: corrida.status
      });
    }

    const atualizada = await pool.query(
      `UPDATE corridas
       SET status = 'complete',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [corrida_id]
    );

    await registrarEvento(
      corrida_id,
      "ride_completed",
      {
        estadoAnterior: "in_transit",
        estadoNovo: "complete"
      }
    );

    if (corrida.motorista_id) {
      await pool.query(
        `UPDATE usuarios
         SET disponivel = TRUE
         WHERE id = $1`,
        [corrida.motorista_id]
      );
    }

    return res.json({
      mensagem: "Corrida finalizada com sucesso.",
      corrida: atualizada.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao finalizar corrida."
    });
  }
}

async function listarFilaCorridas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM fila_corridas ORDER BY id`
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao listar fila."
    });
  }
}

module.exports = {
  solicitarCorrida,
  listarCorridas,
  buscarCorridaPorId,
  confirmarCorrida,
  iniciarCorrida,
  finalizarCorrida,
  listarFilaCorridas
};