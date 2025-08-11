const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "orbit_db",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on("connect", () => {
  console.log("🛸 Conectado ao banco de dados PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro na conexão com o banco:", err);
  process.exit(-1);
});

module.exports = pool;
