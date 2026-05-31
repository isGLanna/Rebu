const pool = require("../config/db");
const { buscarRota } = require("../services/routeService");
const { registrarEvento } = require("../utils/auditLogger");

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

  // Verifica se origem e destino foram enviados em texto
  const temTexto = origem && destino;

  // Verifica se origem e destino foram enviados por coordenadas
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

    // Define origem e destino finais
    const origemFinal = origem || `${origem_lat},${origem_lng}`;
    const destinoFinal = destino || `${destino_lat},${destino_lng}`;

    let rotaCoordenadas = null;

    // Se vierem coordenadas, busca rota real no serviço de rotas
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

    // Conta quantas corridas existem na fila local
    const fila = await pool.query(
      `SELECT COUNT(*) FROM fila_corridas`
    );

    const quantidadeNaFila = Number(fila.rows[0].count);

    // Verifica se a fila local atingiu o limite configurado
    const servicoCongestionado = quantidadeNaFila >= LIMITE_FILA;

    // Se o serviço estiver congestionado, a corrida entra na fila local
    // e também na fila de saída para futura delegação ao Core
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

      // Registra a corrida na fila local
      await pool.query(
        `INSERT INTO fila_corridas (corrida_id, motivo)
         VALUES ($1, $2)`,
        [
          corridaPendente.rows[0].id,
          "Serviço congestionado: fila local atingiu o limite"
        ]
      );

      // Registra a corrida na fila de saída para futura delegação ao Core
      await pool.query(
        `INSERT INTO fila_saida_corridas (
          corrida_id,
          destino_service_id,
          motivo
        )
        VALUES ($1, $2, $3)`,
        [
          corridaPendente.rows[0].id,
          "CORE",
          "Serviço congestionado: fila local atingiu o limite"
        ]
      );

      // Gera log estruturado com nível WARN
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
        mensagem: "Serviço congestionado. Corrida enviada para fila local e fila de saída.",
        politica_overflow: `fila_corridas >= ${LIMITE_FILA}`,
        corrida: corridaPendente.rows[0],
        rota: rotaCoordenadas
      });
    }

    // Busca um motorista disponível para atender a corrida
    const motoristaDisponivel = await pool.query(
      `SELECT * FROM usuarios
       WHERE tipo = 'motorista'
       AND disponivel = TRUE
       LIMIT 1`
    );

    // Se existir motorista disponível, a corrida vai para o estado match
    if (motoristaDisponivel.rows.length > 0) {
      const motoristaId = motoristaDisponivel.rows[0].id;

      // Marca o motorista como ocupado
      await pool.query(
        `UPDATE usuarios
         SET disponivel = FALSE
         WHERE id = $1`,
        [motoristaId]
      );

      // Cria corrida já atribuída ao motorista
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

      // Gera log estruturado de corrida atribuída
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

    // Se não houver motorista disponível, a corrida fica aguardando na fila local
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

    // Registra corrida na fila local
    await pool.query(
      `INSERT INTO fila_corridas (corrida_id, motivo)
       VALUES ($1, $2)`,
      [
        corridaPendente.rows[0].id,
        "Sem motoristas disponíveis"
      ]
    );

    // Gera log estruturado com nível WARN
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

// Busca uma corrida específica pelo id
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

// Função genérica para validar e atualizar o estado da corrida
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

    // Garante que a transição siga a ordem esperada da máquina de estados
    if (corrida.status !== statusAtualEsperado) {
      return res.status(400).json({
        erro: "Transição inválida.",
        status_atual: corrida.status
      });
    }

    // Atualiza o status da corrida
    const atualizada = await pool.query(
      `UPDATE corridas
       SET status = $1,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [novoStatus, corrida_id]
    );

    // Registra a transição no audit log
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

// Match -> Confirm
async function confirmarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "match", "confirm");
}

// Confirm -> In Transit
async function iniciarCorrida(req, res) {
  return atualizarStatusCorrida(req, res, "confirm", "in_transit");
}

// In Transit -> Complete
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

    // Só permite finalizar corridas que já estejam em andamento
    if (corrida.status !== "in_transit") {
      return res.status(400).json({
        erro: "Transição inválida.",
        status_atual: corrida.status
      });
    }

    // Atualiza a corrida para complete
    const atualizada = await pool.query(
      `UPDATE corridas
       SET status = 'complete',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [corrida_id]
    );

    // Registra a conclusão da corrida no audit log
    await registrarEvento(
      corrida_id,
      "ride_completed",
      {
        estadoAnterior: "in_transit",
        estadoNovo: "complete"
      }
    );

    // Libera o motorista após a finalização da corrida
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

// Lista a fila local de corridas
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

// Lista corridas recebidas de outros serviços, futuramente via Core
async function listarFilaEntrada(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM fila_entrada_corridas
       ORDER BY id`
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao listar fila de entrada."
    });
  }
}

// Lista corridas aguardando delegação para o Core
async function listarFilaSaida(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM fila_saida_corridas
       ORDER BY id`
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao listar fila de saída."
    });
  }
}

// Reprocessa corridas que estão aguardando na fila há mais de 10 minutos
async function reprocessarFila(req, res) {
  try {
    const corridasPendentes = await pool.query(
      `SELECT *
       FROM fila_corridas
       WHERE criada_em <= NOW() - INTERVAL '10 minutes'`
    );

    let quantidadeReprocessada = 0;

    for (const corrida of corridasPendentes.rows) {
      // Registra no audit log que a corrida foi reprocessada
      await registrarEvento(
        corrida.corrida_id,
        "ride_reprocessed",
        {
          motivo: "Corrida reprocessada automaticamente após 10 minutos na fila"
        }
      );

      quantidadeReprocessada++;
    }

    return res.json({
      mensagem: "Reprocessamento concluído.",
      corridasReprocessadas: quantidadeReprocessada
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao reprocessar fila."
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
  listarFilaCorridas,
  listarFilaEntrada,
  listarFilaSaida,
  reprocessarFila
};