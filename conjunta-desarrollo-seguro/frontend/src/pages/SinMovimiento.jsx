import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import api from '../services/api';
import TableSkeleton from '../components/TableSkeleton';

export default function SinMovimiento() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/sin-movimiento')
      .then(({ data }) => setProductos(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Productos sin movimiento</h1>
      <p className="text-sm text-slate-400 mb-6">Productos sin entradas ni salidas en los últimos 30 días</p>

      {loading ? (
        <TableSkeleton columns={4} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Stock Actual</th>
                  <th className="text-left px-4 py-3 font-medium">Último Movimiento</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.stock_actual}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.ultimo_movimiento ? new Date(p.ultimo_movimiento).toLocaleDateString('es-PE') : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productos.length === 0 && (
            <div className="text-center py-10">
              <PackageSearch size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Todos los productos tienen movimiento reciente 🎉</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}