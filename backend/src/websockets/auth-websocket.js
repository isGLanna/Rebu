const jwt = require("jsonwebtoken");

function authenticateToken(socket, next) {
  const token = socket.handshake.auth.token;

  if(!token) {
    return next(new Error("Token de autenticação não fornecido"));
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  socket.usuario = decoded;
  next()
}

module.exports = authenticateToken;