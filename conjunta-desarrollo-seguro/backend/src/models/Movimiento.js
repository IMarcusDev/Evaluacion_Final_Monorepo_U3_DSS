const pool = require('../config/db');

const Movimiento = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre AS producto_nombre, p.sku, u.nombre AS usuario_nombre
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.created_at DESC
    `);
    return rows;
  },

  async getByProducto(producto_id) {
    const [rows] = await pool.query(`
      SELECT m.*, u.nombre AS usuario_nombre
      FROM movimientos m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.producto_id = ?
      ORDER BY m.created_at DESC
    `, [producto_id]);
    return rows;
  },

  async registrar({ producto_id, usuario_id, tipo, cantidad, motivo }) {
    cantidad = parseInt(cantidad);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [productoRows] = await conn.query('SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
      if (productoRows.length === 0) throw new Error('Producto no encontrado');

      const stock_anterior = productoRows[0].stock_actual;
      let stock_nuevo;

      if (tipo === 'entrada') {
        stock_nuevo = stock_anterior + cantidad;
      } else if (tipo === 'salida') {
        if (cantidad > stock_anterior) throw new Error('Stock insuficiente para esta salida');
        stock_nuevo = stock_anterior - cantidad;
      } else {
        throw new Error('Tipo de movimiento inválido');
      }

      await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stock_nuevo, producto_id]);

      const [result] = await conn.query(
        `INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo]
      );

      await conn.commit();
      return { id: result.insertId, stock_anterior, stock_nuevo };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
};

module.exports = Movimiento;