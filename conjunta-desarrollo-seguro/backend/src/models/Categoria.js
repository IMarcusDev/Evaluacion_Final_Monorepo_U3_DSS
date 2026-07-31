const pool = require('../config/db');

const Categoria = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { nombre, descripcion } = data;
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, descripcion } = data;
    await pool.query(
      'UPDATE categorias SET nombre=?, descripcion=? WHERE id = ?',
      [nombre, descripcion, id]
    );
  },

  async tieneProductos(id) {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND activo = TRUE', [id]);
    return rows[0].total > 0;
  },

  async delete(id) {
    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
  }
};

module.exports = Categoria;