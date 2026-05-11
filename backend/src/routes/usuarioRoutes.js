const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const autenticarToken = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - tipo
 *             properties:
 *               nome:
 *                 type: string
 *                 example: José Otávio
 *               email:
 *                 type: string
 *                 example: jose@email.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *               tipo:
 *                 type: string
 *                 example: passageiro
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados incompletos
 */
router.post("/usuarios", usuarioController.cadastrarUsuario);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: jose@email.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Senha incorreta
 *       404:
 *         description: Usuário não encontrado
 */
router.post("/login", usuarioController.login);

/**
 * @swagger
 * /perfil:
 *   get:
 *     summary: Perfil do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido
 */
router.get("/perfil", autenticarToken, (req, res) => {
  res.json({
    mensagem: "Token válido",
    usuario: req.usuario
  });
});

module.exports = router;