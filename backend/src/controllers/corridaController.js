const pool = require("../config/db");
const { buscarRota } = require("../services/routeService");

// Limite máximo de corridas na fila antes de considerar congestionamento
const LIMITE_FILA = 3;

// Solicita uma nova corrida
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

  // Verifica se foi enviado origem/destino por texto
  const temTexto = origem && destino;

  // Verifica se foi enviado origem/destino por coordenadas
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
    // Verifica se o passageiro existe
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

    // Define origem/destino finais
    const origemFinal = origem || `${origem_lat},${origem_lng}`;
    const destinoFinal = destino || `${destino_lat},${destino_lng}`;

    let rotaCoordenadas = null;

    // Se vierem coordenadas, busca a rota real na OpenRouteService
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

    // Conta quantas corridas existem na fila
    const fila = await pool.query(
      `SELECT COUNT(*) FROM fila_corridas`
    );

    const quantidadeNaFila = Number(fila.rows[0].count);

    // Define se o sistema está congestionado
    const servicoCongestionado = quantidadeNaFila >= LIMITE_FILA;

    // Se estiver congestionado, envia direto para fila
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

      return res.status(201).json({
        mensagem: "Serviço congestionado. Corrida enviada para fila local.",
        politica_overflow: `fila_corridas >= ${LIMITE_FILA}`,
        corrida: corridaPendente.rows[0],
        rota: rotaCoordenadas
      });
    }

    // Busca apenas motoristas disponíveis
    const motoristaDisponivel = await pool.query(
      `SELECT * FROM usuarios
       WHERE tipo = 'motorista'
       AND disponivel = TRUE
       LIMIT 1`
    );

    // Se encontrou motorista
    if (motoristaDisponivel.rows.length > 0) {
      const motoristaId = motoristaDisponivel.rows[0].id;

      // Marca motorista como ocupado
      await pool.query(
        `UPDATE usuarios
         SET disponivel = FALSE
         WHERE id = $1`,
        [motoristaId]
      );

      // Cria corrida já em match
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

      return res.status(201).json({
        mensagem: "Corrida criada com motorista atribuído.",
        corrida: corrida.rows[0],
        rota: rotaCoordenadas
      });
    }

    // Se não encontrou motorista, envia para fila
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

// Lista todas as corridas
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

// Busca corrida específica
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

// Função genérica de mudança de estado
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

// Match -> Confirm
async function confirmarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "match", "confirm");
}

// Confirm -> In Transit
async function iniciarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "confirm", "in_transit");
}

// In Transit -> Complete + libera motorista
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

    // Libera o motorista
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

// Lista fila de corridas
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