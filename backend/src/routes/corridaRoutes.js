const express = require("express");
const router = express.Router();

const {
  solicitarCorrida,
  listarCorridas,
  buscarCorridaPorId,
  confirmarCorrida,
  iniciarCorrida,
  finalizarCorrida,
  listarFilaCorridas
} = require("../controllers/corridaController");

const {
  verificarToken,
  verificarPassageiro
} = require("../middleware/authMiddleware");

router.get("/", listarCorridas);
router.get("/fila/pendentes", listarFilaCorridas);
router.get("/:corrida_id", buscarCorridaPorId);

router.post(
  "/:passageiro_id/solicitar",
  verificarToken,
  verificarPassageiro,
  solicitarCorrida
);

router.patch("/:corrida_id/confirmar", confirmarCorrida);
router.patch("/:corrida_id/iniciar", iniciarCorrida);
router.patch("/:corrida_id/finalizar", finalizarCorrida);

module.exports = router;