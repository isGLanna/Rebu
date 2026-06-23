const express = require("express");
const router = express.Router();

const { receberLeilao, receberAtribuicao } = require("../controllers/leilaoController");

/**
 * POST /rides/incoming
 *
 * [WEBHOOK] O Core chama este endpoint em todos os grupos durante o leilão.
 * Responda com proposta (200) ou passe (204). Resposta deve ser SÍNCRONA
 * dentro do prazo auctionDeadline.
 *
 * Ref: openapi.yaml webhooks./rides/incoming
 */
router.post("/incoming", receberLeilao);

/**
 * POST /rides/:rideUuid/assigned
 *
 * [WEBHOOK] O Core chama este endpoint exclusivamente no grupo vencedor
 * após encerrar o leilão. O lock já foi transferido para este grupo.
 * Responda com 200 para confirmar recebimento.
 *
 * Ref: openapi.yaml webhooks./rides/{rideUuid}/assigned
 */
router.post("/:rideUuid/assigned", receberAtribuicao);

module.exports = router;
