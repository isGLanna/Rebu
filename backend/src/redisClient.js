const { createClient } = require("redis");

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379`
});

redisClient.on("error", (erro) => {
  console.error("Erro no Redis:", erro);
});

redisClient.on("connect", () => {
  console.log("Conectado ao Redis");
});

module.exports = redisClient;