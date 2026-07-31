const pool = require('../config/db');

const seedController = {
  async cargarDemo(req, res) {
    try {
      const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM productos');
      if (total > 3) {
        return res.status(400).json({ message: 'Ya hay datos en el sistema. Usa esta opción solo en una base de datos casi vacía.' });
      }

      const categorias = [
        ['Electrónica', 'Dispositivos y accesorios electrónicos'],
        ['Oficina', 'Artículos de oficina'],
        ['Limpieza', 'Productos de limpieza'],
      ];
      const catIds = [];
      for (const [nombre, descripcion] of categorias) {
        const [r] = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        catIds.push(r.insertId);
      }

      const proveedores = [
        ['TechSupply Demo SAC', 'Carlos Ramos', '987654321', 'ventas@techsupply-demo.com'],
        ['OfiMax Demo EIRL', 'Rosa Mendoza', '987001122', 'contacto@ofimax-demo.com'],
      ];
      const provIds = [];
      for (const [nombre, contacto, telefono, email] of proveedores) {
        const [r] = await pool.query('INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES (?, ?, ?, ?)', [nombre, contacto, telefono, email]);
        provIds.push(r.insertId);
      }

      const productos = [
        ['DEMO-001', 'Mouse Inalámbrico', catIds[0], provIds[0], 25, 45, 50, 10, 'Estante A-1'],
        ['DEMO-002', 'Teclado Mecánico', catIds[0], provIds[0], 80, 150, 25, 8, 'Estante A-2'],
        ['DEMO-003', 'Papel Bond A4', catIds[1], provIds[1], 18, 28, 100, 20, 'Estante B-1'],
        ['DEMO-004', 'Desinfectante 1L', catIds[2], provIds[1], 8, 15, 3, 10, 'Estante C-1'],
        ['DEMO-005', 'Monitor 24 pulgadas', catIds[0], provIds[0], 450, 650, 15, 5, 'Estante A-3'],
      ];
      const prodIds = [];
      for (const [sku, nombre, categoria_id, proveedor_id, pc, pv, stock, min, ubicacion] of productos) {
        const [r] = await pool.query(
          `INSERT INTO productos (sku, nombre, categoria_id, proveedor_id, precio_compra, precio_venta, stock_actual, stock_minimo, ubicacion)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sku, nombre, categoria_id, proveedor_id, pc, pv, stock, min, ubicacion]
        );
        prodIds.push(r.insertId);
      }

      await pool.query(
        `INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, 'entrada', 20, 30, 50, 'Reposición inicial demo')`,
        [prodIds[0], req.usuario.id]
      );
      await pool.query(
        `INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, 'salida', 5, 30, 25, 'Venta demo')`,
        [prodIds[1], req.usuario.id]
      );

      res.json({ message: 'Datos demo cargados correctamente' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = seedController;