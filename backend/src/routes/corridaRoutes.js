const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/corridaController");

const {
  verificarToken,
  verificarPassageiro
} = require("../middleware/authMiddleware");

// CONSULTAS DE CORRIDAS

// Lista todas as corridas cadastradas
router.get("/", listarCorridas);

// Lista corridas que estão na fila local
router.get("/fila/pendentes", listarFilaCorridas);

// Lista corridas recebidas de outros serviços (integração futura com Core)
router.get("/fila/entrada", listarFilaEntrada);

// Lista corridas aguardando delegação para o Core
router.get("/fila/saida", listarFilaSaida);

// Reprocessa corridas antigas da fila
router.post("/fila/reprocessar", reprocessarFila);

// Busca uma corrida específica pelo ID
// Deve ficar depois das rotas /fila para evitar conflitos
router.get("/:corrida_id", buscarCorridaPorId);

// CRIAÇÃO DE CORRIDAS

// Solicita uma nova corrida
router.post(
  "/:passageiro_id/solicitar",
  verificarToken,
  verificarPassageiro,
  solicitarCorrida
);

// TRANSIÇÕES DE ESTADO
// request -> match -> confirm -> in_transit -> complete

// Confirma uma corrida já atribuída
router.patch("/:corrida_id/confirmar", confirmarCorrida);

// Inicia uma corrida confirmada
router.patch("/:corrida_id/iniciar", iniciarCorrida);

// Finaliza uma corrida em andamento
router.patch("/:corrida_id/finalizar", finalizarCorrida);

module.exports = router;