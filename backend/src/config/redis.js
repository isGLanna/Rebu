const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379)
  }
});

redisClient.on("error", (erro) => {
  console.error("[REDIS] Erro:", erro.message);
});

async function conectarRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("[REDIS] Conectado com sucesso");
  }
}

module.exports = {
  redisClient,
  conectarRedis
};