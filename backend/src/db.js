const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: process.env.DB_HOST || "localhost",
  database: "rebu",
  password: process.env.DB_PASSWORD || 'food',
  port: 5432,
});

module.exports = pool;