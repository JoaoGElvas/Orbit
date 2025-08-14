const knex = require('knex');
const config = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

/**
 * Script para marcar migrations como executadas quando as tabelas já existem
 * Útil quando se está migrando de um sistema de schema manual para migrations
 */
async function markMigrationsAsCompleted() {
  try {
    console.log('🔄 Verificando migrations pendentes...');
    
    // Verifica se a tabela de migrations existe
    const migrationTableExists = await db.schema.hasTable('knex_migrations');
    
    if (!migrationTableExists) {
      console.log('📊 Criando tabela de migrations...');
      await db.migrate.latest();
      return;
    }

    // Busca migrations pendentes
    const completed = await db('knex_migrations').select('*');
    const [migrationList] = await db.migrate.list();
    
    const completedNames = new Set(completed.map(m => m.name));
    const pendingMigrations = migrationList.filter(name => !completedNames.has(name));

    if (pendingMigrations.length === 0) {
      console.log('✅ Todas as migrations já estão marcadas como executadas');
      return;
    }

    console.log(`📝 Marcando ${pendingMigrations.length} migrations como executadas:`);
    
    // Marca cada migration pendente como executada
    for (const migrationName of pendingMigrations) {
      await db('knex_migrations').insert({
        name: migrationName,
        batch: 1,
        migration_time: new Date()
      });
      console.log(`  ✅ ${migrationName}`);
    }

    console.log('🎉 Todas as migrations foram marcadas como executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao marcar migrations:', error.message);
  } finally {
    await db.destroy();
  }
}

// Executar se o script for chamado diretamente
if (require.main === module) {
  markMigrationsAsCompleted();
}

module.exports = markMigrationsAsCompleted;
