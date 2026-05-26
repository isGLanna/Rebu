require("dotenv").config();
require("./config/db");

const app = require("./app");

const PORT = process.env.PORT || 3001;

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});