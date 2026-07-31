const Producto = require('../models/Producto');
const Auditoria = require('../models/Auditoria');
const path = require('path');

const productoController = {
  async getAll(req, res) {
    try {
      const productos = await Producto.getAll();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async siguienteSku(req, res) {
    try {
      const [rows] = await require('../config/db').query(
        `SELECT sku FROM productos WHERE sku REGEXP '^PROD-[0-9]+$' ORDER BY CAST(SUBSTRING(sku, 6) AS UNSIGNED) DESC LIMIT 1`
      );
      let siguiente = 1;
      if (rows.length > 0) {
        const num = parseInt(rows[0].sku.split('-')[1]);
        siguiente = num + 1;
      }
      const sku = `PROD-${String(siguiente).padStart(3, '0')}`;
      res.json({ sku });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async subirImagen(req, res) {
    try {
      if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen' });
      const url = `/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const producto = await Producto.getById(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Producto.create(req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'crear',
        tabla_afectada: 'productos',
        registro_id: id,
        detalle: `Creó el producto "${req.body.nombre}" (SKU: ${req.body.sku})`
      });
      res.status(201).json({ id, message: 'Producto creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const anterior = await Producto.getById(req.params.id);

      await Producto.update(req.params.id, req.body);

      const cambioCompra = Number(anterior.precio_compra) !== Number(req.body.precio_compra);
      const cambioVenta = Number(anterior.precio_venta) !== Number(req.body.precio_venta);

      if (cambioCompra || cambioVenta) {
        await require('../config/db').query(
          `INSERT INTO historial_precios (producto_id, usuario_id, precio_compra_anterior, precio_compra_nuevo, precio_venta_anterior, precio_venta_nuevo)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.params.id, req.usuario.id, anterior.precio_compra, req.body.precio_compra, anterior.precio_venta, req.body.precio_venta]
        );
      }

      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'productos',
        registro_id: req.params.id,
        detalle: `Editó el producto "${req.body.nombre}"`
      });
      res.json({ message: 'Producto actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const producto = await Producto.getById(req.params.id);
      await Producto.delete(req.params.id);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'eliminar',
        tabla_afectada: 'productos',
        registro_id: req.params.id,
        detalle: `Eliminó el producto "${producto?.nombre || req.params.id}"`
      });
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getEliminados(req, res) {
    try {
      const productos = await Producto.getEliminados();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async restaurar(req, res) {
    try {
      await Producto.restaurar(req.params.id);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'productos',
        registro_id: req.params.id,
        detalle: 'Restauró un producto desde la papelera'
      });
      res.json({ message: 'Producto restaurado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async cargaMasiva(req, res) {
    try {
      if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo' });

      const XLSX = require('xlsx');
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja);

      const [categorias] = await require('../config/db').query('SELECT id, nombre FROM categorias');
      const [proveedores] = await require('../config/db').query('SELECT id, nombre FROM proveedores');

      const buscarCategoria = (nombre) => categorias.find(c => c.nombre.toLowerCase() === String(nombre || '').toLowerCase())?.id || null;
      const buscarProveedor = (nombre) => proveedores.find(p => p.nombre.toLowerCase() === String(nombre || '').toLowerCase())?.id || null;

      const resultados = { creados: 0, errores: [] };

      for (const [i, fila] of filas.entries()) {
        try {
          const { sku, nombre, descripcion, categoria, proveedor, precio_compra, precio_venta, stock_actual, stock_minimo, ubicacion } = fila;

          if (!sku || !nombre) {
            resultados.errores.push(`Fila ${i + 2}: falta SKU o nombre`);
            continue;
          }

          await Producto.create({
            sku: String(sku),
            nombre: String(nombre),
            descripcion: descripcion || '',
            categoria_id: buscarCategoria(categoria),
            proveedor_id: buscarProveedor(proveedor),
            precio_compra: Number(precio_compra) || 0,
            precio_venta: Number(precio_venta) || 0,
            stock_actual: Number(stock_actual) || 0,
            stock_minimo: Number(stock_minimo) || 5,
            ubicacion: ubicacion || '',
            imagen_url: null
          });

          resultados.creados++;
        } catch (err) {
          resultados.errores.push(`Fila ${i + 2} (${fila.sku || '?'}): ${err.message}`);
        }
      }

      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'crear',
        tabla_afectada: 'productos',
        registro_id: null,
        detalle: `Carga masiva: ${resultados.creados} productos creados`
      });

      res.json(resultados);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getHistorialPrecios(req, res) {
    try {
      const [rows] = await require('../config/db').query(`
        SELECT hp.*, u.nombre AS usuario_nombre
        FROM historial_precios hp
        LEFT JOIN usuarios u ON hp.usuario_id = u.id
        WHERE hp.producto_id = ?
        ORDER BY hp.created_at DESC
      `, [req.params.id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = productoController;