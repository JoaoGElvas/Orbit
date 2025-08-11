const pool = require("../config/database");

class Task {
  static async create(
    userId,
    title,
    description,
    priority = "normal",
    type = "daily"
  ) {
    // Obter a próxima posição
    const positionQuery = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position 
      FROM tasks 
      WHERE user_id = $1 AND type = $2 AND completed = false
    `;
    const positionResult = await pool.query(positionQuery, [userId, type]);
    const position = positionResult.rows[0].next_position;

    const query = `
      INSERT INTO tasks (user_id, title, description, priority, type, position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      title,
      description,
      priority,
      type,
      position,
    ]);
    return result.rows[0];
  }

  static async findByUser(userId, type = null, completed = null) {
    let query = "SELECT * FROM tasks WHERE user_id = $1";
    const params = [userId];

    if (type !== null) {
      query += " AND type = $2";
      params.push(type);
    }

    if (completed !== null) {
      query += ` AND completed = $${params.length + 1}`;
      params.push(completed);
    }

    query += " ORDER BY position ASC, created_at DESC";

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(taskId, userId) {
    const query = "SELECT * FROM tasks WHERE id = $1 AND user_id = $2";
    const result = await pool.query(query, [taskId, userId]);
    return result.rows[0];
  }

  static async update(taskId, userId, updates) {
    const allowedFields = ["title", "description", "priority", "position"];
    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      throw new Error("Nenhum campo válido para atualizar");
    }

    values.push(taskId, userId);
    const query = `
      UPDATE tasks 
      SET ${setClause.join(", ")}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async complete(taskId, userId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Marcar tarefa como completa
      const taskQuery = `
        UPDATE tasks 
        SET completed = true, completed_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const taskResult = await client.query(taskQuery, [taskId, userId]);

      if (taskResult.rows.length === 0) {
        throw new Error("Tarefa não encontrada");
      }

      const task = taskResult.rows[0];

      // Adicionar ao histórico
      await client.query(
        `
        INSERT INTO task_history (user_id, task_title, task_description, priority, type)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [userId, task.title, task.description, task.priority, task.type]
      );

      // Atualizar estatísticas do usuário
      await client.query(
        `
        UPDATE user_stats 
        SET 
          focus_points = focus_points + 1,
          total_tasks_completed = total_tasks_completed + 1,
          last_activity_date = CURRENT_DATE
        WHERE user_id = $1
      `,
        [userId]
      );

      // Calcular e atualizar streak
      await this.updateStreak(client, userId);

      await client.query("COMMIT");
      return taskResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStreak(client, userId) {
    // Verificar se completou tarefas hoje
    const todayQuery = `
      SELECT COUNT(*) as count
      FROM task_history 
      WHERE user_id = $1 AND DATE(completed_at) = CURRENT_DATE
    `;
    const todayResult = await client.query(todayQuery, [userId]);

    if (todayResult.rows[0].count > 0) {
      // Verificar se completou tarefas ontem
      const yesterdayQuery = `
        SELECT COUNT(*) as count
        FROM task_history 
        WHERE user_id = $1 AND DATE(completed_at) = CURRENT_DATE - INTERVAL '1 day'
      `;
      const yesterdayResult = await client.query(yesterdayQuery, [userId]);

      if (yesterdayResult.rows[0].count > 0) {
        // Continuar streak
        await client.query(
          `
          UPDATE user_stats 
          SET 
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1)
          WHERE user_id = $1
        `,
          [userId]
        );
      } else {
        // Começar novo streak
        await client.query(
          `
          UPDATE user_stats 
          SET 
            current_streak = 1,
            best_streak = GREATEST(best_streak, 1)
          WHERE user_id = $1
        `,
          [userId]
        );
      }
    }
  }

  static async reorder(userId, taskIds) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (let i = 0; i < taskIds.length; i++) {
        await client.query(
          `
          UPDATE tasks 
          SET position = $1 
          WHERE id = $2 AND user_id = $3
        `,
          [i + 1, taskIds[i], userId]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(taskId, userId) {
    const query =
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [taskId, userId]);
    return result.rows[0];
  }

  static async getHistory(userId, limit = 50) {
    const query = `
      SELECT * FROM task_history 
      WHERE user_id = $1 
      ORDER BY completed_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}

module.exports = Task;
