const Proveedor = require('../models/Proveedor');
const Auditoria = require('../models/Auditoria');

const proveedorController = {
  async getAll(req, res) {
    try {
      const proveedores = await Proveedor.getAll();
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const proveedor = await Proveedor.getById(req.params.id);
      if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
      res.json(proveedor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Proveedor.create(req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'crear',
        tabla_afectada: 'proveedores',
        registro_id: id,
        detalle: `Creó el proveedor "${req.body.nombre}"`
      });
      res.status(201).json({ id, message: 'Proveedor creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Proveedor.update(req.params.id, req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'proveedores',
        registro_id: req.params.id,
        detalle: `Editó el proveedor "${req.body.nombre}"`
      });
      res.json({ message: 'Proveedor actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const tieneProductos = await Proveedor.tieneProductos(req.params.id);
      if (tieneProductos) {
        return res.status(400).json({ message: 'No se puede eliminar: hay productos asociados a este proveedor' });
      }

      const proveedor = await Proveedor.getById(req.params.id);
      await Proveedor.delete(req.params.id);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'eliminar',
        tabla_afectada: 'proveedores',
        registro_id: req.params.id,
        detalle: `Eliminó el proveedor "${proveedor?.nombre || req.params.id}"`
      });
      res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = proveedorController;