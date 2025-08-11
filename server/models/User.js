const pool = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async create(username, email, password) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;

    const result = await pool.query(query, [username, email, passwordHash]);

    // Criar estatísticas iniciais para o usuário
    await pool.query(
      `
      INSERT INTO user_stats (user_id)
      VALUES ($1)
    `,
      [result.rows[0].id]
    );

    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query =
      "SELECT id, username, email, created_at FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async updateLastActivity(userId) {
    const query = `
      UPDATE user_stats 
      SET last_activity_date = CURRENT_DATE 
      WHERE user_id = $1
    `;
    await pool.query(query, [userId]);
  }

  static async getStats(userId) {
    const query = "SELECT * FROM user_stats WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = User;
