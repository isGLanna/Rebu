const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";
const TIPOS_VALIDOS = ["passageiro", "motorista"];

function normalizarTipo(tipo) {
  if (tipo === "driver") return "motorista";
  if (tipo === "passenger" || tipo === "rider") return "passageiro";
  return tipo;
}

async function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body;
  const tipo = normalizarTipo(req.body.tipo);

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({
      erro: "Tipo de usuário inválido. Use passageiro ou motorista."
    });
  }

  try {
    const resultado = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo",
      [nome, email, senha, tipo]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "23505") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }

    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  const tipoSolicitado = normalizarTipo(req.body.tipo);

  if (!email || !senha) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const usuario = resultado.rows[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    if (tipoSolicitado && usuario.tipo !== tipoSolicitado) {
      return res.status(403).json({
        erro: `Esse usuário está cadastrado como ${usuario.tipo}`
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no login" });
  }
}

module.exports = {
  cadastrarUsuario,
  login
};