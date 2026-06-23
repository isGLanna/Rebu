const express = require("express");
const router = express.Router();

const { receberCorridaDelegada } = require("../controllers/delegacaoController");

/**
 * POST /delegacao/corrida
 *
 * Endpoint chamado pelo Core para nos delegar uma corrida.
 * Todas as mensagens de delegação passam pelo Core — nunca diretamente
 * entre serviços.
 */
router.post("/corrida", receberCorridaDelegada);

module.exports = router;
