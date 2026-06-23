const { Server } = require("socket.io")
const authenticateToken = require("./auth-websocket.js")

let io;

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



    socket.on("join_trip_room", (tripId) => {
      const roomName = `trip_${tripId}`
      socket.join(roomName);
    });
    socket.on("update_my_location", ({ tripId, coords }) => {
      const roomName = `trip_${tripId}`
      socket.to(roomName).emit("driver_location_updated", coords);
    });

    socket.on("disconnect")
  });

  return io
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io não inicializado. Chame initSocket primeiro.");
  }
  return io;
}

module.exports = { initSocket, getIO };