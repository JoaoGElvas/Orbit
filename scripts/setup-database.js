const { Pool } = require("pg");
require("dotenv").config();

// Conectar ao PostgreSQL sem especificar o banco para criar o banco se necessário
const adminPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Pool para o banco específico
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "orbit_db",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  try {
    console.log("🚀 Iniciando setup do banco de dados Orbit...");

    // Tentar criar o banco se não existir
    try {
      await adminPool.query(
        `CREATE DATABASE ${process.env.DB_NAME || "orbit_db"}`
      );
      console.log("✅ Banco de dados criado com sucesso");
    } catch (err) {
      if (err.code === "42P04") {
        console.log("ℹ️  Banco de dados já existe");
      } else {
        console.error("❌ Erro ao criar banco:", err.message);
      }
    }

    // Criar tabelas
    console.log("📊 Criando tabelas...");

    // Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela users criada");

    // Tabela de tarefas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'critical')),
        type VARCHAR(20) DEFAULT 'daily' CHECK (type IN ('daily', 'weekly')),
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela tasks criada");

    // Tabela de estatísticas do usuário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        focus_points INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        total_tasks_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela user_stats criada");

    // Tabela de histórico de tarefas (Diário de Bordo)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_title VARCHAR(255) NOT NULL,
        task_description TEXT,
        priority VARCHAR(20),
        type VARCHAR(20),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        focus_points_earned INTEGER DEFAULT 1
      )
    `);
    console.log("✅ Tabela task_history criada");

    // Criar índices para melhorar performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_task_history_user_id ON task_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_task_history_completed_at ON task_history(completed_at);
    `);
    console.log("✅ Índices criados");

    // Trigger para atualizar updated_at automaticamente
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
      CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("✅ Triggers criados");

    console.log("🌌 Setup do banco de dados concluído com sucesso!");
    console.log("🚀 O sistema Orbit está pronto para uso!");
  } catch (error) {
    console.error("❌ Erro durante o setup:", error);
    process.exit(1);
  } finally {
    await adminPool.end();
    await pool.end();
  }
}

// Executar setup se o script for chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
