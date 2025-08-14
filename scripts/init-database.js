const knex = require('knex');
const config = require('../knexfile');

/**
 * Script para garantir que as migrations sejam executadas antes de iniciar o servidor
 * Especialmente útil para deploys automatizados na Railway
 */
async function initializeDatabase() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('🔄 Verificando estado do banco de dados...');
    
    // Verifica se consegue conectar no banco
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco estabelecida');
    
    // Executa migrations pendentes
    console.log('🔄 Verificando migrations pendentes...');
    const [completed, pending] = await db.migrate.list();
    
    if (pending.length > 0) {
      console.log(`📊 Executando ${pending.length} migrations pendentes...`);
      await db.migrate.latest();
      console.log('✅ Migrations executadas com sucesso');
    } else {
      console.log('ℹ️  Todas as migrations já estão atualizadas');
    }
    
    // Opcional: Executar seeds em desenvolvimento
    if (environment === 'development') {
      try {
        console.log('🌱 Verificando seeds...');
        // Verifica se há usuários, se não houver, executa seeds
        const userCount = await db('users').count('id as count').first();
        if (!userCount || userCount.count === '0') {
          console.log('🌱 Executando seeds...');
          await db.seed.run();
          console.log('✅ Seeds executados com sucesso');
        }
      } catch (seedError) {
        console.log('⚠️  Seeds não executados:', seedError.message);
      }
    }
    
    console.log('🚀 Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error.message);
    
    // Se for erro de tabela não existir, tenta executar migrations
    if (error.code === '42P01') {
      console.log('🔄 Tentando executar migrations...');
      try {
        await db.migrate.latest();
        console.log('✅ Migrations executadas após erro');
      } catch (migrationError) {
        console.error('❌ Erro ao executar migrations:', migrationError.message);
        throw migrationError;
      }
    } else {
      throw error;
    }
  } finally {
    await db.destroy();
  }
}

module.exports = initializeDatabase;

// Executar se o script for chamado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error);
      process.exit(1);
    });
}
