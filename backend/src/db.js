const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rebu",
  password: "food",
  port: 5432,
});

module.exports = pool;