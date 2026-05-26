const express = require("express");
const router = express.Router();

const {
  criarUsuario,
  listarUsuarios,
  listarMotoristas,
  listarPassageiros,
  loginUsuario,
  atualizarMotorista,
  deletarMotorista
} = require("../controllers/usuarioController");

// Cadastro
router.post("/", criarUsuario);

// Login
router.post("/login", loginUsuario);

// Listagens
router.get("/", listarUsuarios);
router.get("/motoristas", listarMotoristas);
router.get("/passageiros", listarPassageiros);

// CRUD motorista
router.put("/motoristas/:id", atualizarMotorista);
router.delete("/motoristas/:id", deletarMotorista);

module.exports = router;