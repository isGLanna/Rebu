const express = require("express");
const router = express.Router();

const autenticarToken = require("../middlewares/authMiddleware");
const pagamentoController = require("../controllers/pagamentoController");

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: Realizar pagamento de uma corrida
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - corridaId
 *               - metodo
 *             properties:
 *               corridaId:
 *                 type: integer
 *                 example: 1
 *               metodo:
 *                 type: string
 *                 example: pix
 *                 description: Use pix, cartao ou dinheiro
 *     responses:
 *       201:
 *         description: Pagamento realizado com sucesso
 *       400:
 *         description: Dados incompletos ou método inválido
 *       401:
 *         description: Token não enviado ou inválido
 *       404:
 *         description: Corrida não encontrada, não finalizada ou não pertence ao passageiro
 */
router.post("/pagamentos", autenticarToken, pagamentoController.pagarCorrida);

/**
 * @swagger
 * /pagamentos/{corridaId}:
 *   get:
 *     summary: Consultar pagamento de uma corrida
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: corridaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *       401:
 *         description: Token não enviado ou inválido
 *       404:
 *         description: Pagamento não encontrado
 */
router.get(
  "/pagamentos/:corridaId",
  autenticarToken,
  pagamentoController.buscarPagamentoPorCorrida
);

module.exports = router;