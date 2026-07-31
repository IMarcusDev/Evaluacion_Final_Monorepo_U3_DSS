const pool = require('../config/db');

const dashboardController = {
  async getMetricas(req, res) {
    try {
      const [[valorInventario]] = await pool.query(`
        SELECT SUM(precio_compra * stock_actual) AS valor_total
        FROM productos WHERE activo = TRUE
      `);

      const [[totales]] = await pool.query(`
        SELECT COUNT(*) AS total_productos, SUM(stock_actual) AS total_unidades
        FROM productos WHERE activo = TRUE
      `);

      const [stockBajo] = await pool.query(`
        SELECT id, sku, nombre, stock_actual, stock_minimo
        FROM productos
        WHERE activo = TRUE AND stock_actual <= stock_minimo
        ORDER BY stock_actual ASC
      `);

      const [masMovidos] = await pool.query(`
        SELECT p.id, p.sku, p.nombre, SUM(m.cantidad) AS total_movido
        FROM movimientos m
        JOIN productos p ON m.producto_id = p.id
        GROUP BY p.id, p.sku, p.nombre
        ORDER BY total_movido DESC
        LIMIT 5
      `);

      const [movimientosPorDia] = await pool.query(`
        SELECT DATE(created_at) AS fecha, tipo, SUM(cantidad) AS cantidad
        FROM movimientos
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at), tipo
        ORDER BY fecha ASC
      `);

      res.json({
        valor_inventario: valorInventario.valor_total || 0,
        total_productos: totales.total_productos || 0,
        total_unidades: totales.total_unidades || 0,
        productos_stock_bajo: stockBajo,
        productos_mas_movidos: masMovidos,
        movimientos_por_dia: movimientosPorDia
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getTendencias(req, res) {
    try {
      const [entradasVsSalidas] = await pool.query(`
      SELECT DATE(created_at) AS fecha, tipo, SUM(cantidad) AS total
      FROM movimientos
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at), tipo
      ORDER BY fecha ASC
    `);

      res.json({ entradasVsSalidas });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAlertas(req, res) {
    try {
      const [[conteo]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM productos
      WHERE activo = TRUE AND stock_actual <= stock_minimo
    `);
      res.json({ total: conteo.total || 0 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getSinMovimiento(req, res) {
    try {
      const [productos] = await pool.query(`
      SELECT p.id, p.sku, p.nombre, p.stock_actual, p.updated_at,
        MAX(m.created_at) AS ultimo_movimiento
      FROM productos p
      LEFT JOIN movimientos m ON m.producto_id = p.id
      WHERE p.activo = TRUE
      GROUP BY p.id, p.sku, p.nombre, p.stock_actual, p.updated_at
      HAVING ultimo_movimiento IS NULL OR ultimo_movimiento < DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY ultimo_movimiento ASC
    `);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getValorPorCategoria(req, res) {
    try {
      const [datos] = await pool.query(`
      SELECT COALESCE(c.nombre, 'Sin categoría') AS categoria, SUM(p.precio_compra * p.stock_actual) AS valor
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
      GROUP BY c.nombre
      HAVING valor > 0
      ORDER BY valor DESC
    `);
      res.json(datos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = dashboardController;