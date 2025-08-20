require("dotenv").config();

/**
 * Configuração do Knex.js ajustada para Railway.
 * * - development: Mantido para ambiente local com .env
 * - production: Simplificado para usar DATABASE_URL diretamente,
 * que é a forma mais comum e robusta para plataformas de nuvem.
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "orbit_db",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },

  // A seção de staging foi mantida como referência
  staging: {
    client: "postgresql",
    connection: process.env.DATABASE_URL + "?ssl=no-verify",
    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },

  production: {
    client: "postgresql",
    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    // Passar a DATABASE_URL diretamente para a propriedade 'connection'
    // é a maneira mais padrão e confiável. O driver 'pg' do Node.js
    // sabe como interpretar essa string, incluindo as configurações de SSL.
    connection: process.env.DATABASE_URL,
    // ---------------------------------
    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
