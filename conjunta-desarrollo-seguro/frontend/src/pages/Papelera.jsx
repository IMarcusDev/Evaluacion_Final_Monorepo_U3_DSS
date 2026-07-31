import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TableSkeleton from '../components/TableSkeleton';

export default function Papelera() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    api.get('/productos/eliminados')
      .then(({ data }) => setProductos(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const restaurar = async (id) => {
    try {
      await api.patch(`/productos/${id}/restaurar`);
      toast.success('Producto restaurado');
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al restaurar');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Papelera</h1>
      <p className="text-sm text-slate-400 mb-6">Productos eliminados. Puedes restaurarlos si fue un error.</p>

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-400">{p.categoria_nombre || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.stock_actual}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => restaurar(p.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 px-2 py-1"
                        >
                          <RotateCcw size={14} /> Restaurar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productos.length === 0 && <p className="text-center text-slate-500 py-8">La papelera está vacía</p>}
        </div>
      )}
    </div>
  );
}