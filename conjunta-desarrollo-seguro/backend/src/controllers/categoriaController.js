const Categoria = require('../models/Categoria');
const Auditoria = require('../models/Auditoria');

const categoriaController = {
  async getAll(req, res) {
    try {
      const categorias = await Categoria.getAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const categoria = await Categoria.getById(req.params.id);
      if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const id = await Categoria.create(req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'crear',
        tabla_afectada: 'categorias',
        registro_id: id,
        detalle: `Creó la categoría "${req.body.nombre}"`
      });
      res.status(201).json({ id, message: 'Categoría creada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Categoria.update(req.params.id, req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'categorias',
        registro_id: req.params.id,
        detalle: `Editó la categoría "${req.body.nombre}"`
      });
      res.json({ message: 'Categoría actualizada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const tieneProductos = await Categoria.tieneProductos(req.params.id);
      if (tieneProductos) {
        return res.status(400).json({ message: 'No se puede eliminar: hay productos asociados a esta categoría' });
      }

      const categoria = await Categoria.getById(req.params.id);
      await Categoria.delete(req.params.id);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'eliminar',
        tabla_afectada: 'categorias',
        registro_id: req.params.id,
        detalle: `Eliminó la categoría "${categoria?.nombre || req.params.id}"`
      });
      res.json({ message: 'Categoría eliminada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = categoriaController;