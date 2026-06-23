const pool = require("../config/db");
const { registrarEvento } = require("../utils/auditLogger");
const { tick } = require("../utils/lamportClock");
const coreClient = require("../services/coreClient");

// ---------------------------------------------------------------------------
// Webhook 1: POST /rides/incoming
//
// O Core chama este endpoint em todos os grupos participantes durante o leilão.
// Este serviço deve responder SINCRONAMENTE com uma proposta (200) ou passar (204).
//
// Critério de seleção do vencedor pelo Core (executado no Core):
//   1º menor estimatedPrice → 2º menor estimatedEta → 3º ordem lexicográfica de groupId
// ---------------------------------------------------------------------------

/**
 * Recebe uma oferta de leilão do Core.
 * Decide se este serviço pode atender a corrida e retorna proposta ou passa.
 *
 * Body esperado (RideAuctionNotification):
 *   rideUuid, origin, destination, originServiceId, passengerId,
 *   passengerName, logicalTimestamp, auctionDeadline
 */
async function receberLeilao(req, res) {
  const {
    rideUuid,
    origin,
    destination,
    originServiceId,
    passengerId,
    passengerName,
    logicalTimestamp: coreTimestamp,
    auctionDeadline
  } = req.body;

  // Sincroniza relógio de Lamport com o timestamp do Core
  const meuTimestamp = tick(coreTimestamp || 0);

  // Verifica se o prazo do leilão já passou
  if (auctionDeadline && new Date() > new Date(auctionDeadline)) {
    console.warn(`[leilaoController] Leilão ${rideUuid} já encerrado (deadline: ${auctionDeadline})`);
    return res.status(204).send(); // passa — fora do prazo
  }

  try {
    // Verifica se há motoristas disponíveis para avaliar capacidade de atender
    const motoristas = await pool.query(
      `SELECT COUNT(*) FROM usuarios WHERE tipo = 'motorista' AND disponivel = TRUE`
    );

    const qtdMotoristas = Number(motoristas.rows[0].count);

    // Verifica o tamanho da fila local para decidir se participa
    const fila = await pool.query(`SELECT COUNT(*) FROM fila_corridas`);
    const qtdFila = Number(fila.rows[0].count);

    // Passa o leilão se não tiver motoristas ou se a fila local já estiver cheia
    if (qtdMotoristas === 0 || qtdFila >= 3) {
      console.log(`[leilaoController] Passando leilão ${rideUuid} (motoristas=${qtdMotoristas}, fila=${qtdFila})`);
      return res.status(204).send();
    }

    // Registra no audit log que participamos do leilão
    console.log(`[leilaoController] Participando do leilão ${rideUuid} (motoristas=${qtdMotoristas})`);

    // Calcula proposta: ETA estimado em segundos e preço estimado em BRL
    // Valores simples — podem ser melhorados com routeService
    const estimatedEta = 180 + Math.floor(Math.random() * 120); // 3-5 min
    const estimatedPrice = 15.00 + (qtdFila * 2.00); // preço cresce com a fila

    // Retorna proposta (200) — o Core seleciona o vencedor
    return res.status(200).json({
      estimatedEta,
      estimatedPrice,
      logicalTimestamp: meuTimestamp
    });

  } catch (erro) {
    console.error("[leilaoController] Erro ao avaliar leilão:", erro);
    // Em caso de erro, passa o leilão para não prejudicar o fluxo do Core
    return res.status(204).send();
  }
}

// ---------------------------------------------------------------------------
// Webhook 2: POST /rides/{rideUuid}/assigned
//
// O Core chama este endpoint EXCLUSIVAMENTE no grupo vencedor após encerrar o leilão.
// O lock distribuído já foi transferido para este grupo junto com este callback.
// Este serviço deve:
//   1. Confirmar o recebimento com 200
//   2. Inserir a corrida localmente
//   3. Atribuir um motorista
//   4. Adquirir/renovar o lock
//   5. Transitar a corrida para "confirm" no Core
// ---------------------------------------------------------------------------

/**
 * Recebe a notificação de vitória no leilão.
 * O Core já transferiu o lock para este grupo; devemos confirmar e progredir a saga.
 *
 * Body esperado (RideAssignment):
 *   rideUuid, origin, destination, passengerId, passengerName,
 *   originServiceId, logicalTimestamp, lockExpiresAt
 */
async function receberAtribuicao(req, res) {
  const {
    rideUuid,
    origin,
    destination,
    passengerId,
    passengerName,
    originServiceId,
    logicalTimestamp: coreTimestamp,
    lockExpiresAt
  } = req.body;

  // Sincroniza relógio de Lamport com o timestamp do Core
  tick(coreTimestamp || 0);

  // Responde 200 imediatamente para o Core (confirmação síncrona)
  // O processamento continua de forma assíncrona
  res.status(200).json({ ok: true });

  // Processamento assíncrono após responder ao Core
  setImmediate(async () => {
    try {
      const origemTexto = [origin?.street, origin?.number, origin?.city].filter(Boolean).join(", ");
      const destinoTexto = [destination?.street, destination?.number, destination?.city].filter(Boolean).join(", ");

      // Idempotência: verifica se a corrida já existe localmente
      const existente = await pool.query(`SELECT id FROM corridas WHERE id = $1`, [rideUuid]);

      let corridaLocal;

      if (existente.rows.length > 0) {
        corridaLocal = existente.rows[0];
        console.log(`[leilaoController] Corrida ${rideUuid} já existe localmente.`);
      } else {
        // Insere a corrida delegada no banco local
        const inserida = await pool.query(
          `INSERT INTO corridas (
            id, passageiro_id, origem, destino,
            origem_lat, origem_lng, destino_lat, destino_lng, status
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *`,
          [
            rideUuid,
            passageiro_id_local(passengerId), // tenta resolver o passageiro
            origemTexto || origin?.street || "Origem via Core",
            destinoTexto || destination?.street || "Destino via Core",
            origin?.lat || null,
            origin?.lng || null,
            destination?.lat || null,
            destination?.lng || null,
            "request"
          ]
        );

        corridaLocal = inserida.rows[0];
      }

      // Registra na fila de entrada
      await pool.query(
        `INSERT INTO fila_entrada_corridas (corrida_id, origem_service_id, motivo)
         VALUES ($1, $2, $3)`,
        [rideUuid, originServiceId || "CORE", "Atribuída como vencedor do leilão"]
      );

      await registrarEvento(
        rideUuid,
        "ride_won_auction",
        {
          originServiceId,
          lockExpiresAt,
          coreTimestamp
        }
      );

      // Tenta atribuir motorista disponível
      const motoristaResult = await pool.query(
        `SELECT * FROM usuarios WHERE tipo = 'motorista' AND disponivel = TRUE LIMIT 1`
      );

      if (motoristaResult.rows.length === 0) {
        console.warn(`[leilaoController] Sem motoristas para corrida ${rideUuid} — lock pode expirar`);
        return;
      }

      const motoristaId = motoristaResult.rows[0].id;

      await pool.query(`UPDATE usuarios SET disponivel = FALSE WHERE id = $1`, [motoristaId]);
      await pool.query(
        `UPDATE corridas SET motorista_id = $1, status = 'match', atualizado_em = CURRENT_TIMESTAMP WHERE id = $2`,
        [motoristaId, rideUuid]
      );

      await registrarEvento(
        rideUuid,
        "ride_matched",
        { estadoAnterior: "request", estadoNovo: "match", motoristaId }
      );

      // Renova o lock no Core (já temos o lock, aqui confirmamos/renovamos o TTL)
      try {
        await coreClient.adquirirLock(rideUuid, 60);
      } catch (erroLock) {
        console.warn(`[leilaoController] Falha ao renovar lock ${rideUuid}:`, erroLock.message);
      }

      // Transita para "confirm" no Core (requer lock)
      try {
        await coreClient.atualizarStatusNoCore(rideUuid, "confirm");

        await pool.query(
          `UPDATE corridas SET status = 'confirm', atualizado_em = CURRENT_TIMESTAMP WHERE id = $1`,
          [rideUuid]
        );

        await registrarEvento(
          rideUuid,
          "ride_confirm",
          { estadoAnterior: "match", estadoNovo: "confirm" }
        );

        console.log(`[leilaoController] Corrida ${rideUuid} confirmada com sucesso.`);
      } catch (erroCore) {
        console.error(`[leilaoController] Falha ao confirmar corrida ${rideUuid} no Core:`, erroCore.message);
      }

    } catch (erro) {
      console.error(`[leilaoController] Erro ao processar atribuição ${rideUuid}:`, erro);
    }
  });
}

// Tenta encontrar o passageiro local pelo ID do Core; retorna null se não existir
function passageiro_id_local(passengerId) {
  // O ID do passageiro no Core pode não coincidir com nosso banco.
  // Retornamos o valor como-está; o INSERT pode falhar por FK se não existir.
  // Em produção, deve haver uma tabela de mapeamento ou passageiro convidado.
  return passengerId;
}

module.exports = {
  receberLeilao,
  receberAtribuicao
};
