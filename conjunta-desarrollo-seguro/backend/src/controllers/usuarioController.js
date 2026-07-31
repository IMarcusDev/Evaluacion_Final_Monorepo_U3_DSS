const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');

const usuarioController = {
  async getAll(req, res) {
    try {
      const usuarios = await Usuario.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

async create(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const existente = await Usuario.getByEmail(email);
      if (existente) return res.status(400).json({ message: 'El email ya está registrado' });

      const hash = await bcrypt.hash(password, 10);
      const id = await Usuario.create({ nombre, email, password: hash, rol });

      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'crear',
        tabla_afectada: 'usuarios',
        registro_id: id,
        detalle: `Creó el usuario "${nombre}" (${email}, rol: ${rol})`
      });

      res.status(201).json({ id, message: 'Usuario creado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      await Usuario.update(req.params.id, req.body);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'usuarios',
        registro_id: req.params.id,
        detalle: `Editó el usuario "${req.body.nombre}"`
      });
      res.json({ message: 'Usuario actualizado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async toggleActivo(req, res) {
    try {
      const { activo } = req.body;
      await Usuario.toggleActivo(req.params.id, activo);
      await Auditoria.registrar({
        usuario_id: req.usuario.id,
        accion: 'editar',
        tabla_afectada: 'usuarios',
        registro_id: req.params.id,
        detalle: activo ? 'Activó un usuario' : 'Desactivó un usuario'
      });
      res.json({ message: activo ? 'Usuario activado' : 'Usuario desactivado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = usuarioController;