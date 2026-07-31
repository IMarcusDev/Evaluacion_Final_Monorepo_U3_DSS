const pool = require('../config/db');

const Producto = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.activo = TRUE
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { sku, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_actual, stock_minimo, ubicacion, imagen_url } = data;
    const [result] = await pool.query(
      `INSERT INTO productos (sku, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_actual, stock_minimo, ubicacion, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_actual, stock_minimo, ubicacion, imagen_url]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { sku, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, ubicacion, imagen_url } = data;
    await pool.query(
      `UPDATE productos SET sku=?, nombre=?, descripcion=?, categoria_id=?, proveedor_id=?, precio_compra=?, precio_venta=?, stock_minimo=?, ubicacion=?, imagen_url=?
       WHERE id = ?`,
      [sku, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, ubicacion, imagen_url, id]
    );
  },

  async delete(id) {
    await pool.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
  },

  async getEliminados() {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.activo = FALSE
      ORDER BY p.updated_at DESC
    `);
    return rows;
  },

  async restaurar(id) {
    await pool.query('UPDATE productos SET activo = TRUE WHERE id = ?', [id]);
  }
};

module.exports = Producto;