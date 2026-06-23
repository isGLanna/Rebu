const pool = require("../config/db");
const { registrarEvento } = require("../utils/auditLogger");
const coreClient = require("../services/coreClient");

/**
 * Recebe uma corrida delegada pelo Core.
 * O Core nos chama neste endpoint quando somos o vencedor de um leilão
 * ou quando decide nos atribuir uma corrida de outro grupo.
 *
 * Fluxo:
 *  1. Valida o payload recebido
 *  2. Insere a corrida no banco local (status "request")
 *  3. Registra na fila_entrada_corridas
 *  4. Tenta atribuir imediatamente a um motorista disponível
 *  5. Envia proposta/confirmação ao Core
 *  6. Registra evento no audit log
 */
async function receberCorridaDelegada(req, res) {
  const {
    auctionId,
    rideId,
    passageiroId,
    origem,
    destino,
    origemLat,
    origemLng,
    destinoLat,
    destinoLng,
    origemServiceId
  } = req.body;

  // Valida campos obrigatórios do payload do Core
  if (!rideId || !passageiroId || (!origem && origemLat === undefined)) {
    return res.status(400).json({
      erro: "Payload inválido. Campos obrigatórios: rideId, passageiroId, origem ou coordenadas."
    });
  }

  const origemFinal = origem || `${origemLat},${origemLng}`;
  const destinoFinal = destino || `${destinoLat},${destinoLng}`;

  try {
    // Verifica se a corrida delegada já existe localmente (idempotência)
    const existente = await pool.query(
      `SELECT id FROM corridas WHERE id = $1`,
      [rideId]
    );

    let corridaLocal;

    if (existente.rows.length > 0) {
      corridaLocal = existente.rows[0];
    } else {
      // Insere a corrida recebida do Core no banco local
      const inserida = await pool.query(
        `INSERT INTO corridas (
          id,
          passageiro_id,
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
          rideId,
          passageiroId,
          origemFinal,
          destinoFinal,
          origemLat || null,
          origemLng || null,
          destinoLat || null,
          destinoLng || null,
          "request"
        ]
      );

      corridaLocal = inserida.rows[0];
    }

    // Registra na fila de entrada
    await pool.query(
      `INSERT INTO fila_entrada_corridas (corrida_id, origem_service_id, motivo)
       VALUES ($1, $2, $3)`,
      [
        corridaLocal.id,
        origemServiceId || "CORE",
        "Corrida delegada pelo Core via leilão"
      ]
    );

    // Registra no audit log local
    await registrarEvento(
      corridaLocal.id,
      "ride_delegated_received",
      {
        origemServiceId: origemServiceId || "CORE",
        auctionId: auctionId || null,
        estadoNovo: "request"
      }
    );

    // Tenta atribuir imediatamente a um motorista disponível
    const motoristaDisponivel = await pool.query(
      `SELECT * FROM usuarios
       WHERE tipo = 'motorista'
       AND disponivel = TRUE
       LIMIT 1`
    );

    if (motoristaDisponivel.rows.length > 0) {
      const motoristaId = motoristaDisponivel.rows[0].id;

      // Marca o motorista como ocupado
      await pool.query(
        `UPDATE usuarios SET disponivel = FALSE WHERE id = $1`,
        [motoristaId]
      );

      // Atribui o motorista à corrida
      await pool.query(
        `UPDATE corridas
         SET motorista_id = $1, status = 'match', atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [motoristaId, corridaLocal.id]
      );

      await registrarEvento(
        corridaLocal.id,
        "ride_matched",
        {
          estadoAnterior: "request",
          estadoNovo: "match",
          motoristaId,
          fonte: "delegacao_entrada"
        }
      );

      // Envia proposta de volta ao Core (temos motorista disponível)
      if (auctionId) {
        try {
          await coreClient.enviarProposta(auctionId, {
            etaMinutos: 5, // valor estimado; pode ser calculado com routeService
            precoEstimado: 20.00
          });
        } catch (erroCore) {
          // Falha não interrompe o fluxo local — apenas loga
          console.warn("[delegacaoController] Falha ao enviar proposta ao Core:", erroCore.message);
        }
      }

      return res.status(201).json({
        mensagem: "Corrida delegada recebida e atribuída a motorista.",
        corrida: { ...corridaLocal, motorista_id: motoristaId, status: "match" }
      });
    }

    // Sem motorista disponível: corrida vai para fila local
    await pool.query(
      `INSERT INTO fila_corridas (corrida_id, motivo)
       VALUES ($1, $2)`,
      [corridaLocal.id, "Corrida delegada pelo Core — sem motoristas disponíveis"]
    );

    await registrarEvento(
      corridaLocal.id,
      "ride_queued",
      {
        estadoAnterior: null,
        estadoNovo: "request",
        motivo: "Corrida delegada pelo Core — sem motoristas disponíveis"
      },
      "WARN"
    );

    return res.status(201).json({
      mensagem: "Corrida delegada recebida. Sem motoristas disponíveis — enviada para fila local.",
      corrida: corridaLocal
    });

  } catch (erro) {
    console.error("[delegacaoController] Erro:", erro);

    return res.status(500).json({
      erro: "Erro ao processar corrida delegada."
    });
  }
}

module.exports = {
  receberCorridaDelegada
};
