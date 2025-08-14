/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('task_history', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('task_title', 255).notNullable();
    table.text('task_description');
    table.string('priority', 20);
    table.string('type', 20);
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    table.integer('focus_points_earned').defaultTo(1);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Índices
    table.index(['user_id']);
    table.index(['completed_at']);
    table.index(['user_id', 'completed_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('task_history');
};
