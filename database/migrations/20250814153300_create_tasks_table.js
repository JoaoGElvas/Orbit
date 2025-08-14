/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.enu('priority', ['low', 'normal', 'critical']).defaultTo('normal');
    table.enu('type', ['daily', 'weekly']).defaultTo('daily');
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at');
    table.integer('position').defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Índices
    table.index(['user_id']);
    table.index(['completed']);
    table.index(['user_id', 'completed']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tasks');
};
