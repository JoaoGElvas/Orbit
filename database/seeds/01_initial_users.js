const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('task_history').del();
  await knex('tasks').del();
  await knex('user_stats').del();
  await knex('users').del();

  // Hash da senha padrão para usuários de teste
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // Inserts seed entries
  const users = await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@orbit.com',
      password_hash: defaultPasswordHash
    },
    {
      username: 'usuario_teste',
      email: 'teste@orbit.com', 
      password_hash: defaultPasswordHash
    }
  ]).returning('id');

  // Inserir estatísticas iniciais para os usuários
  await knex('user_stats').insert([
    {
      user_id: users[0].id || users[0],
      focus_points: 0,
      current_streak: 0,
      best_streak: 0,
      total_tasks_completed: 0
    },
    {
      user_id: users[1].id || users[1],
      focus_points: 0,
      current_streak: 0, 
      best_streak: 0,
      total_tasks_completed: 0
    }
  ]);
};
