const Movimiento = require('../models/Movimiento');

const movimientoController = {
  async getAll(req, res) {
    try {
      const movimientos = await Movimiento.getAll();
      res.json(movimientos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getByProducto(req, res) {
    try {
      const movimientos = await Movimiento.getByProducto(req.params.producto_id);
      res.json(movimientos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async registrar(req, res) {
    try {
      const { producto_id, tipo, cantidad, motivo } = req.body;
      const usuario_id = req.usuario.id;

      const resultado = await Movimiento.registrar({ producto_id, usuario_id, tipo, cantidad, motivo });
      res.status(201).json({ message: 'Movimiento registrado', ...resultado });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = movimientoController;