const pool = require("../config/db");
const { buscarRota } = require("../services/routeService");
const { registrarEvento } = require("../utils/auditLogger");
const {
  adicionarNaFilaRedis,
  removerDaFilaRedis
} = require("../services/queueRedisService");
const { getIO } = require("../websockets/socket");
const coreClient = require("../services/coreClient");

// Limite máximo de corridas na fila antes de considerar congestionamento
const LIMITE_FILA = 50;

// Tempo para finalizar a corrida automaticamente
const TEMPO_FINALIZACAO_MS = 30000;

// Processa automaticamente a próxima corrida da fila local ou da fila de entrada do Core
async function processarProximaCorridaDaFila(motoristaId) {
  try {
    // Primeiro tenta buscar corrida da fila local
    let filaOrigem = "local";

    let proximaFila = await pool.query(
      `SELECT f.id AS fila_id,
              f.corrida_id,
              c.*
       FROM fila_corridas f
       JOIN corridas c ON c.id = f.corrida_id
       WHERE c.status = 'request'
       ORDER BY f.criado_em ASC
       LIMIT 1`
    );

    // Se não tiver corrida local, tenta buscar corrida recebida do Core
    if (proximaFila.rows.length === 0) {
      filaOrigem = "entrada_core";

      proximaFila = await pool.query(
        `SELECT f.id AS fila_id,
                f.corrida_id,
                c.*
         FROM fila_entrada_corridas f
         JOIN corridas c ON c.id = f.corrida_id
         WHERE c.status = 'request'
         ORDER BY f.criado_em ASC
         LIMIT 1`
      );
    }

    // Se não houver nenhuma corrida em fila, motorista fica disponível
    if (proximaFila.rows.length === 0) {
      await pool.query(
        `UPDATE usuarios
         SET disponivel = TRUE
         WHERE id = $1`,
        [motoristaId]
      );

      console.log(`[AUTO] Motorista ${motoristaId} ficou disponível. Nenhuma corrida na fila.`);
      return false;
    }

    const corrida = proximaFila.rows[0];

    // Marca motorista como ocupado novamente
    await pool.query(
      `UPDATE usuarios
       SET disponivel = FALSE
       WHERE id = $1`,
      [motoristaId]
    );

    // Atualiza corrida para match e atribui o motorista
    const corridaAtualizada = await pool.query(
      `UPDATE corridas
       SET status = 'match',
           motorista_id = $1,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [motoristaId, corrida.corrida_id]
    );

    // Remove a corrida da fila usada
    if (filaOrigem === "local") {
      await pool.query(
        `DELETE FROM fila_corridas
         WHERE id = $1`,
        [corrida.fila_id]
      );

      await removerDaFilaRedis(
        "rebu:fila:local",
        corrida.corrida_id
      );

      // Se essa corrida também estava aguardando saída para o Core, remove para evitar duplicidade
      await pool.query(
        `DELETE FROM fila_saida_corridas
         WHERE corrida_id = $1`,
        [corrida.corrida_id]
      );

      await removerDaFilaRedis(
        "rebu:fila:saida",
        corrida.corrida_id
      );
    }

    if (filaOrigem === "entrada_core") {
      await pool.query(
        `DELETE FROM fila_entrada_corridas
         WHERE id = $1`,
        [corrida.fila_id]
      );

      await removerDaFilaRedis(
        "rebu:fila:entrada",
        corrida.corrida_id
      );
    }

    // Registra no audit log que a corrida saiu da fila
    await registrarEvento(
      corrida.corrida_id,
      "ride_dequeued",
      {
        estadoAnterior: "request",
        estadoNovo: "match",
        filaOrigem,
        motoristaId
      }
    );

    // Registra o match automático
    await registrarEvento(
      corrida.corrida_id,
      "ride_matched",
      {
        estadoAnterior: "request",
        estadoNovo: "match",
        motoristaId,
        automatico: true,
        origemFila: filaOrigem
      }
    );

    // Continua o fluxo automático da corrida
    await automatizarFluxoCorrida(
      corridaAtualizada.rows[0].id,
      motoristaId
    );

    console.log(`[AUTO] Motorista ${motoristaId} pegou corrida ${corrida.corrida_id} da fila ${filaOrigem}.`);
    return true;

  } catch (erro) {
    console.error(`[AUTO] Erro ao processar próxima corrida da fila: ${erro.message}`);

    await pool.query(
      `UPDATE usuarios
       SET disponivel = TRUE
       WHERE id = $1`,
      [motoristaId]
    );

    return false;
  }
}

// Automatiza o fluxo da corrida quando há motorista disponível
async function automatizarFluxoCorrida(corridaId, motoristaId) {
  try {
    // Match -> Confirm
    await pool.query(
      `UPDATE corridas
       SET status = 'confirm',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'match'`,
      [corridaId]
    );

    await registrarEvento(
      corridaId,
      "ride_confirm",
      {
        estadoAnterior: "match",
        estadoNovo: "confirm",
        automatico: true
      }
    );

    // Confirm -> In Transit
    await pool.query(
      `UPDATE corridas
       SET status = 'in_transit',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'confirm'`,
      [corridaId]
    );

    await registrarEvento(
      corridaId,
      "ride_in_transit",
      {
        estadoAnterior: "confirm",
        estadoNovo: "in_transit",
        automatico: true
      }
    );

    // Finaliza automaticamente depois do tempo configurado
    setTimeout(async () => {
      try {
        const corridaFinalizada = await pool.query(
          `UPDATE corridas
           SET status = 'complete',
               atualizado_em = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'in_transit'
           RETURNING *`,
          [corridaId]
        );

        if (corridaFinalizada.rows.length === 0) {
          console.warn(`[AUTO] Corrida ${corridaId} não estava em andamento para finalizar.`);
          return;
        }

        await registrarEvento(
          corridaId,
          "ride_completed",
          {
            estadoAnterior: "in_transit",
            estadoNovo: "complete",
            automatico: true
          }
        );

        console.log(`[AUTO] Corrida ${corridaId} finalizada automaticamente.`);

        // Depois de finalizar, tenta pegar a próxima corrida da fila
        await processarProximaCorridaDaFila(motoristaId);

      } catch (erro) {
        console.error(`[AUTO] Erro ao finalizar corrida ${corridaId}: ${erro.message}`);
      }
    }, TEMPO_FINALIZACAO_MS);

  } catch (erro) {
    console.error(`[AUTO] Erro ao automatizar corrida ${corridaId}: ${erro.message}`);
  }
}

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

      // Espelha a fila local no Redis para visualização durante os testes
      await adicionarNaFilaRedis(
        "rebu:fila:local",
        corridaPendente.rows[0].id
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

      // Espelha a fila de saída no Redis para visualização durante os testes
      await adicionarNaFilaRedis(
        "rebu:fila:saida",
        corridaPendente.rows[0].id
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
      
      try {
        const resultado = await coreClient.criarCorridaNoCore(corridaPendente.rows[0]);
        console.log(
          `[corridaController] Corrida delegada ao Core. rideUuid=${resultado?.rideUuid}`,
          resultado
        );
      } catch (erroCore) {
        console.warn(
          "[corridaController] Falha ao delegar corrida ao Core:",
          erroCore.message
        );
      }

      return res.status(201).json({
        mensagem: "Serviço congestionado. Corrida enviada para fila local e delegada ao Core via leilão.",
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

      // Confirma, inicia e finaliza automaticamente
      await automatizarFluxoCorrida(
        corrida.rows[0].id,
        motoristaId
      );

      return res.status(201).json({
        mensagem: "Corrida criada com motorista atribuído. Confirmação, início e finalização serão automáticos.",
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

    // Espelha a fila local no Redis para visualização durante os testes
    await adicionarNaFilaRedis(
      "rebu:fila:local",
      corridaPendente.rows[0].id
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

    try {
      await coreClient.atualizarStatusNoCore(corrida_id, novoStatus);
    } catch (erroCore) {
      console.warn(
        `[corridaController] Falha ao atualizar status '${novoStatus}' no Core para corrida ${corrida_id}:`,
        erroCore.message
      );
    }

    const io = getIO();
    if (io) {
      const roomName = `trip_${corrida_id}`;
      if (novoStatus === "match") io.to(roomName).emit("driver_matched", { tripId: corrida_id });
      if (novoStatus === "confirm") io.to(roomName).emit("driver_arrived", { tripId: corrida_id });
      if (novoStatus === "in_transit") io.to(roomName).emit("trip_started", { tripId: corrida_id });
      if (novoStatus === "complete") io.to(roomName).emit("trip_finished", { tripId: corrida_id, finalCost: atualizada.rows[0].valor || 0 });
    }

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
    
    try {
      await coreClient.atualizarStatusNoCore(corrida_id, "complete");
    } catch (erroCore) {
      console.warn(
        `[corridaController] Falha ao notificar Core sobre finalização da corrida ${corrida_id}:`,
        erroCore.message
      );
    }

    // Depois de finalizar manualmente, tenta pegar a próxima corrida da fila
    if (corrida.motorista_id) {
      await processarProximaCorridaDaFila(corrida.motorista_id);
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
       WHERE criado_em <= NOW() - INTERVAL '10 minutes'`
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