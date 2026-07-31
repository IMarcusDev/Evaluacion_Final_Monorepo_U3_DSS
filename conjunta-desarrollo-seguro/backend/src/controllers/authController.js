const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authController = {
async register(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const existente = await Usuario.getByEmail(email);
      if (existente) return res.status(400).json({ message: 'El email ya está registrado' });

      const hash = await bcrypt.hash(password, 10);
      const id = await Usuario.create({ nombre, email, password: hash, rol });

      res.status(201).json({ id, message: 'Usuario registrado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

async login(req, res) {
    try {
      const { email, password } = req.body;

      const usuario = await Usuario.getByEmail(email);
      if (!usuario) return res.status(401).json({ message: 'Credenciales inválidas' });

      if (!usuario.activo) return res.status(403).json({ message: 'Esta cuenta está desactivada. Contacta a un administrador.' });

      const valido = await bcrypt.compare(password, usuario.password);
      if (!valido) return res.status(401).json({ message: 'Credenciales inválidas' });

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async miPerfil(req, res) {
  try {
    const Usuario = require('../models/Usuario');
    const usuario = await Usuario.getById(req.usuario.id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

async actualizarPerfil(req, res) {
  try {
    const { nombre, passwordActual, passwordNueva } = req.body;
    const bcrypt = require('bcryptjs');
    const pool = require('../config/db');

    if (nombre) {
      await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre, req.usuario.id]);
    }

if (passwordNueva) {
      if (passwordNueva.length < 8) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
      }
      const [rows] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [req.usuario.id]);
      const valido = await bcrypt.compare(passwordActual, rows[0].password);
      if (!valido) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

      const hash = await bcrypt.hash(passwordNueva, 10);
      await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, req.usuario.id]);
    }

    res.json({ message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
};

module.exports = authController;