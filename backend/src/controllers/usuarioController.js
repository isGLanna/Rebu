const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// Cria um novo usuário
async function criarUsuario(req, res) {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({
      erro: "Nome, email, senha e tipo são obrigatórios."
    });
  }

  if (tipo !== "passageiro" && tipo !== "motorista") {
    return res.status(400).json({
      erro: "Tipo deve ser 'passageiro' ou 'motorista'."
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, tipo`,
      [nome, email, senha, tipo]
    );

    return res.status(201).json({
      mensagem: "Usuário criado com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao criar usuário."
    });
  }
}

// Lista todos os usuários
async function listarUsuarios(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email, tipo FROM usuarios ORDER BY id"
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao listar usuários."
    });
  }
}

// Lista apenas motoristas
async function listarMotoristas(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email, tipo FROM usuarios WHERE tipo = 'motorista' ORDER BY id"
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao listar motoristas."
    });
  }
}

// Lista apenas passageiros
async function listarPassageiros(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email, tipo FROM usuarios WHERE tipo = 'passageiro' ORDER BY id"
    );

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao listar passageiros."
    });
  }
}

// Login com geração de token
async function loginUsuario(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: "Email e senha são obrigatórios."
    });
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const usuario = resultado.rows[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
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
    return res.status(500).json({
      erro: "Erro ao realizar login."
    });
  }
}

// Atualiza dados de motorista
async function atualizarMotorista(req, res) {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  try {
    const motoristaExiste = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1 AND tipo = 'motorista'",
      [id]
    );

    if (motoristaExiste.rows.length === 0) {
      return res.status(404).json({
        erro: "Motorista não encontrado."
      });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           senha = COALESCE($3, senha)
       WHERE id = $4
       RETURNING id, nome, email, tipo`,
      [nome, email, senha, id]
    );

    return res.json({
      mensagem: "Motorista atualizado com sucesso.",
      motorista: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao atualizar motorista."
    });
  }
}

// Remove motorista
async function deletarMotorista(req, res) {
  const { id } = req.params;

  try {
    const motoristaExiste = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1 AND tipo = 'motorista'",
      [id]
    );

    if (motoristaExiste.rows.length === 0) {
      return res.status(404).json({
        erro: "Motorista não encontrado."
      });
    }

    // Remove vínculo do motorista com corridas antigas
    await pool.query(
      `UPDATE corridas
       SET motorista_id = NULL
       WHERE motorista_id = $1`,
      [id]
    );

    // Remove o motorista
    await pool.query(
      "DELETE FROM usuarios WHERE id = $1 AND tipo = 'motorista'",
      [id]
    );

    return res.json({
      mensagem: "Motorista deletado com sucesso."
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: "Erro ao deletar motorista."
    });
  }
}

module.exports = {
  criarUsuario,
  listarUsuarios,
  listarMotoristas,
  listarPassageiros,
  loginUsuario,
  atualizarMotorista,
  deletarMotorista
};