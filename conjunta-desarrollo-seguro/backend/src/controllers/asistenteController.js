const pool = require('../config/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const asistenteController = {
  async preguntar(req, res) {
    try {
      const { mensaje } = req.body;

      const [[valorInv]] = await pool.query(`SELECT SUM(precio_compra * stock_actual) AS valor FROM productos WHERE activo = TRUE`);
      const [[totales]] = await pool.query(`SELECT COUNT(*) AS total_productos, SUM(stock_actual) AS total_unidades FROM productos WHERE activo = TRUE`);
      const [stockBajo] = await pool.query(`SELECT sku, nombre, stock_actual, stock_minimo FROM productos WHERE activo = TRUE AND stock_actual <= stock_minimo`);
      const [masMovidos] = await pool.query(`
        SELECT p.nombre, SUM(m.cantidad) AS total FROM movimientos m
        JOIN productos p ON m.producto_id = p.id
        GROUP BY p.id, p.nombre ORDER BY total DESC LIMIT 5
      `);
      const [categorias] = await pool.query(`SELECT nombre FROM categorias`);
      const [proveedores] = await pool.query(`SELECT nombre FROM proveedores`);
      const [productos] = await pool.query(`
        SELECT sku, nombre, stock_actual, precio_compra, precio_venta
        FROM productos WHERE activo = TRUE LIMIT 50
      `);

      const contexto = `Eres el asistente virtual del sistema de inventario InvenTrack. Responde en español, de forma breve y directa, basándote SOLO en estos datos reales del sistema:

Valor total de inventario: S/ ${Number(valorInv.valor || 0).toFixed(2)}
Total de productos activos: ${totales.total_productos}
Total de unidades en stock: ${totales.total_unidades}

Productos con stock bajo (${stockBajo.length}):
${stockBajo.map(p => `- ${p.nombre} (SKU: ${p.sku}): ${p.stock_actual}/${p.stock_minimo}`).join('\n') || 'Ninguno'}

Productos más movidos:
${masMovidos.map(p => `- ${p.nombre}: ${p.total} unidades movidas`).join('\n') || 'Sin movimientos aún'}

Categorías: ${categorias.map(c => c.nombre).join(', ') || 'Ninguna'}
Proveedores: ${proveedores.map(p => p.nombre).join(', ') || 'Ninguno'}

Lista de productos (primeros 50):
${productos.map(p => `- ${p.nombre} (${p.sku}): stock ${p.stock_actual}, compra S/${p.precio_compra}, venta S/${p.precio_venta}`).join('\n')}

Si te preguntan algo que no está en estos datos, dilo claramente sin inventar información.`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: contexto },
          { role: 'user', content: mensaje }
        ],
      });

      const respuesta = completion.choices[0].message.content;
      res.json({ respuesta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al consultar el asistente', detalle: error.message });
    }
  }
};

module.exports = asistenteController;