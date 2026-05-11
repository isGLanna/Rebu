const express = require("express");
const router = express.Router();

const autenticarToken = require("../middlewares/authMiddleware");
const corridaController = require("../controllers/corridaController");

/**
 * @swagger
 * /corridas:
 *   post:
 *     summary: Solicitar uma nova corrida
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origem
 *               - destino
 *             properties:
 *               origem:
 *                 type: string
 *                 example: Universidade Federal de Viçosa, Viçosa, MG
 *               destino:
 *                 type: string
 *                 example: Centro, Viçosa, MG
 *     responses:
 *       201:
 *         description: Corrida solicitada com sucesso
 *       400:
 *         description: Origem e destino são obrigatórios
 *       401:
 *         description: Token não enviado
 */
router.post("/corridas", autenticarToken, corridaController.solicitarCorrida);

/**
 * @swagger
 * /corridas/minhas:
 *   get:
 *     summary: Listar corridas do passageiro autenticado
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de corridas do passageiro
 *       401:
 *         description: Token não enviado
 */
router.get("/corridas/minhas", autenticarToken, corridaController.listarMinhasCorridas);

/**
 * @swagger
 * /corridas/pendentes:
 *   get:
 *     summary: Listar corridas pendentes para motoristas
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de corridas pendentes
 *       401:
 *         description: Token não enviado
 *       403:
 *         description: Apenas motoristas podem ver corridas pendentes
 */
router.get("/corridas/pendentes", autenticarToken, corridaController.listarCorridasPendentes);

/**
 * @swagger
 * /corridas/{id}:
 *   get:
 *     summary: Buscar corrida por ID
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Corrida encontrada
 *       401:
 *         description: Token não enviado
 *       404:
 *         description: Corrida não encontrada
 */
router.get("/corridas/:id", autenticarToken, corridaController.buscarCorridaPorId);

/**
 * @swagger
 * /corridas/{id}/aceitar:
 *   put:
 *     summary: Motorista aceita uma corrida
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Corrida aceita com sucesso
 *       401:
 *         description: Token não enviado
 *       403:
 *         description: Apenas motoristas podem aceitar corridas
 *       404:
 *         description: Corrida não encontrada ou já aceita
 *       409:
 *         description: Corrida já está sendo disputada por outro motorista
 */
router.put("/corridas/:id/aceitar", autenticarToken, corridaController.aceitarCorrida);

/**
 * @swagger
 * /corridas/{id}/finalizar:
 *   put:
 *     summary: Motorista finaliza uma corrida
 *     tags: [Corridas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da corrida
 *     responses:
 *       200:
 *         description: Corrida finalizada com sucesso
 *       401:
 *         description: Token não enviado
 *       403:
 *         description: Apenas motoristas podem finalizar corridas
 *       404:
 *         description: Corrida não encontrada, não pertence ao motorista ou ainda não foi aceita
 */
router.put("/corridas/:id/finalizar", autenticarToken, corridaController.finalizarCorrida);

module.exports = router;