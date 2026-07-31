const pool = require('../config/db');

const Proveedor = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { nombre, contacto, telefono, email, direccion } = data;
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, contacto, telefono, email, direccion]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, contacto, telefono, email, direccion } = data;
    await pool.query(
      'UPDATE proveedores SET nombre=?, contacto=?, telefono=?, email=?, direccion=? WHERE id = ?',
      [nombre, contacto, telefono, email, direccion, id]
    );
  },

  async tieneProductos(id) {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM productos WHERE proveedor_id = ? AND activo = TRUE', [id]);
    return rows[0].total > 0;
  },

  async delete(id) {
    await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
  }
};

module.exports = Proveedor;