const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  }

  static async setVerificationCode(userId, code) {
    await db.execute('UPDATE users SET verification_code = ?, code_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?', [code, userId]);
  }

  static async verifyCode(userId, code) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ? AND verification_code = ? AND code_expiry > NOW()', [userId, code]);
    return rows.length > 0;
  }

  static async clearVerificationCode(userId) {
    await db.execute('UPDATE users SET verification_code = NULL, code_expiry = NULL WHERE id = ?', [userId]);
  }
}

module.exports = User;