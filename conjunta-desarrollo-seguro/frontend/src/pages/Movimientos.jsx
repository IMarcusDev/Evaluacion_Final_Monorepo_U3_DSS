import { useEffect, useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TableSkeleton from '../components/TableSkeleton';
import { exportarExcel, exportarPDF } from '../utils/exportar';
import { FileSpreadsheet, FileText } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ producto_id: '', tipo: 'entrada', cantidad: '', motivo: '' });
  const [error, setError] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  const cargar = async () => {
    setLoading(true);
    const [m, p] = await Promise.all([api.get('/movimientos'), api.get('/productos')]);
    setMovimientos(m.data);
    setProductos(p.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPaginaActual(1); }, [fechaInicio, fechaFin]);

  const abrirNuevo = () => {
    setForm({ producto_id: '', tipo: 'entrada', cantidad: '', motivo: '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/movimientos', form);
      toast.success('Movimiento registrado');
      setModalOpen(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  const movimientosFiltrados = movimientos.filter((m) => {
    const fecha = new Date(m.created_at);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    return true;
  });

  const totalPaginas = Math.ceil(movimientosFiltrados.length / porPagina) || 1;
  const movimientosPagina = movimientosFiltrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  const columnasExport = [
    { key: 'created_at', label: 'Fecha' },
    { key: 'sku', label: 'SKU' },
    { key: 'producto_nombre', label: 'Producto' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'stock_anterior', label: 'Stock Anterior' },
    { key: 'stock_nuevo', label: 'Stock Nuevo' },
    { key: 'usuario_nombre', label: 'Usuario' },
    { key: 'motivo', label: 'Motivo' },
  ];

  const movimientosParaExport = movimientosFiltrados.map((m) => ({
    ...m,
    created_at: new Date(m.created_at).toLocaleString('es-PE'),
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kardex</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportarExcel(movimientosParaExport, columnasExport, 'kardex')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            onClick={() => exportarPDF(movimientosParaExport, columnasExport, 'kardex', 'Reporte de Kardex')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <FileText size={16} /> PDF
          </button>
          <button onClick={abrirNuevo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Registrar Movimiento
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            onClick={() => { setFechaInicio(''); setFechaFin(''); }}
            className="text-xs text-slate-400 hover:text-white px-3 py-2"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Cantidad</th>
                  <th className="text-left px-4 py-3 font-medium">Stock (antes → después)</th>
                  <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientosPagina.map((m) => (
                  <tr key={m.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-400">{new Date(m.created_at).toLocaleString('es-PE')}</td>
                    <td className="px-4 py-3">{m.producto_nombre} <span className="text-slate-500 text-xs">({m.sku})</span></td>
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
          {movimientosFiltrados.length === 0 && <p className="text-center text-slate-500 py-8">No hay movimientos que coincidan con el filtro</p>}
          <Pagination paginaActual={paginaActual} totalPaginas={totalPaginas} onCambiar={setPaginaActual} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Registrar Movimiento</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Producto</label>
                <select
                  value={form.producto_id}
                  onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                  required
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    required
                    className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Motivo</label>
                <input
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  placeholder="Ej: Reposición, venta, ajuste de inventario"
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 mt-2 transition-colors">
                Registrar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}