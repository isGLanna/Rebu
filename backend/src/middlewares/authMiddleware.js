const jwt = require("jsonwebtoken");

const JWT_SECRET = "segredo_super_secreto";

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  jwt.verify(token, JWT_SECRET, (erro, usuario) => {
    if (erro) {
      return res.status(403).json({ erro: "Token inválido" });
    }

    req.usuario = usuario;

    next();
  });
}

module.exports = autenticarToken;