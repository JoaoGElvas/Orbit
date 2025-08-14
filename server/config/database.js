const { Pool } = require("pg");
require("dotenv").config();

// Verifica se o ambiente é de produção (como no Railway)
const isProduction = process.env.NODE_ENV === "production";

// Configuração do banco
let connectionConfig;

if (isProduction && process.env.DATABASE_URL) {
  // Configuração para produção com DATABASE_URL
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // Configuração para desenvolvimento com variáveis individuais
  connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "orbit_db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(connectionConfig);

// O restante do seu arquivo (pool.on('connect'), etc.) pode continuar o mesmo.

// Testar conexão
pool.on("connect", () => {
  console.log("🛸 Conectado ao banco de dados PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro na conexão com o banco:", err);
  process.exit(-1);
});

module.exports = pool;
