import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';
import TableSkeleton from '../components/TableSkeleton';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historialPrecios, setHistorialPrecios] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/productos/${id}`),
      api.get(`/movimientos/producto/${id}`),
      api.get(`/productos/${id}/historial-precios`)
    ]).then(([p, m, hp]) => {
      setProducto(p.data);
      setMovimientos(m.data);
      setHistorialPrecios(hp.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8"><TableSkeleton columns={5} /></div>;
  if (!producto) return <div className="p-8 text-red-400">Producto no encontrado</div>;

  return (
    <div className="p-8">
      <button onClick={() => navigate('/productos')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Volver a Productos
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 flex gap-6">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url.startsWith('/uploads') ? `http://localhost:4000${producto.imagen_url}` : producto.imagen_url}
            alt={producto.nombre}
            className="h-32 w-32 object-cover rounded-lg border border-slate-700"
          />
        ) : (
          <div className="h-32 w-32 bg-slate-800 rounded-lg" />
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">{producto.nombre}</h1>
          <p className="text-sm text-slate-400 mb-4">{producto.sku}</p>
          <p className="text-sm text-slate-300 mb-4">{producto.descripcion || 'Sin descripción'}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Stock actual</p>
              <p className="text-lg font-semibold text-white">{producto.stock_actual}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Stock mínimo</p>
              <p className="text-lg font-semibold text-white">{producto.stock_minimo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Precio compra</p>
              <p className="text-lg font-semibold text-white">S/ {Number(producto.precio_compra).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Precio venta</p>
              <p className="text-lg font-semibold text-white">S/ {Number(producto.precio_venta).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {historialPrecios.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mb-3">Historial de precios</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium">Precio Compra</th>
                    <th className="text-left px-4 py-3 font-medium">Precio Venta</th>
                    <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {historialPrecios.map((h) => (
                    <tr key={h.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-400">{new Date(h.created_at).toLocaleString('es-PE')}</td>
                      <td className="px-4 py-3">S/ {Number(h.precio_compra_anterior).toFixed(2)} → S/ {Number(h.precio_compra_nuevo).toFixed(2)}</td>
                      <td className="px-4 py-3">S/ {Number(h.precio_venta_anterior).toFixed(2)} → S/ {Number(h.precio_venta_nuevo).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-400">{h.usuario_nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold text-white mb-3">Historial de movimientos</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Cantidad</th>
                <th className="text-left px-4 py-3 font-medium">Stock (antes → después)</th>
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">{new Date(m.created_at).toLocaleString('es-PE')}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${m.tipo === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                      {m.tipo === 'entrada' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.cantidad}</td>
                  <td className="px-4 py-3 text-slate-400">{m.stock_anterior} → {m.stock_nuevo}</td>
                  <td className="px-4 py-3 text-slate-400">{m.usuario_nombre}</td>
                  <td className="px-4 py-3 text-slate-400">{m.motivo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movimientos.length === 0 && <p className="text-center text-slate-500 py-8">Este producto no tiene movimientos registrados</p>}
      </div>
    </div>
  );
}