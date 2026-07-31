const Auditoria = require('../models/Auditoria');

const auditoriaController = {
  async getAll(req, res) {
    try {
      const registros = await Auditoria.getAll();
      res.json(registros);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = auditoriaController;