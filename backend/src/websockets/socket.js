const { Server } = require("socket.io")
const authenticateToken = require("./auth-websocket.js")

let io;
const userSockets = new Map();

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
  });

  io.use(authenticateToken);

  io.on("connection", (socket) => {
    console.log(`[Socket] Usuário conectado: ${socket.usuario.nome}`);

    userSockets.set(socket.usuario.id, socket);

    socket.on("join_trip_room", (tripId) => {
      const roomName = `trip_${tripId}`
      socket.join(roomName);
    });
    socket.on("update_location", ({ tripId, coords }) => {
      const roomName = `trip_${tripId}`
      socket.to(roomName).emit("update_location", coords);
    });

    socket.on("disconnect", () => {
      userSockets.delete(socket.usuario.id);
      console.log(`[Socket] Desconectado: ${socket.usuario.nome}`)
    })
  });

  return io
}

function emitToUser(userId, event, data) {
  const socket = userSockets.get(userId);
  if (socket) {
    socket.emit(event, data);
  } else {
    console.log(`[Socket] Usuário ${userId} não conectado. Evento ${event} não enviado.`);
  }
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io não inicializado. Chame initSocket(server) primeiro.");
  }
  return io;
}
module.exports = { initSocket, emitToUser, getIO };