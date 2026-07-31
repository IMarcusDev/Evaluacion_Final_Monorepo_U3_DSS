const pool = require('../config/db');

const Usuario = {
  async getAll() {
    const [rows] = await pool.query('SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC');
    return rows;
  },

  async getByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { nombre, email, password, rol } = data;
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, rol || 'almacenero']
    );
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, email, rol } = data;
    await pool.query(
      'UPDATE usuarios SET nombre=?, email=?, rol=? WHERE id = ?',
      [nombre, email, rol, id]
    );
  },

  async updatePassword(id, passwordHash) {
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, id]);
  },

  async toggleActivo(id, activo) {
    await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]);
  }
};

module.exports = Usuario;