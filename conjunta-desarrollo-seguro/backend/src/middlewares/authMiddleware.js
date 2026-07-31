const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });

    try {
      const [rows] = await pool.query('SELECT activo FROM usuarios WHERE id = ?', [decoded.id]);
      if (rows.length === 0 || !rows[0].activo) {
        return res.status(403).json({ message: 'Tu cuenta ha sido desactivada' });
      }
      req.usuario = decoded;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar usuario' });
    }
  });
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };