const pool = require('../config/db');

const Auditoria = {
  async registrar({ usuario_id, accion, tabla_afectada, registro_id, detalle }) {
    await pool.query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalle)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, accion, tabla_afectada, registro_id, detalle]
    );
  },

  async getAll() {
    const [rows] = await pool.query(`
      SELECT a.*, u.nombre AS usuario_nombre
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 200
    `);
    return rows;
  }
};

module.exports = Auditoria;