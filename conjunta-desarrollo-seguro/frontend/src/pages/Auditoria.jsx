import { useEffect, useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';

const iconos = {
  crear: { icon: PlusCircle, color: 'text-emerald-400' },
  editar: { icon: Pencil, color: 'text-blue-400' },
  eliminar: { icon: Trash2, color: 'text-red-400' },
};

const nombresTabla = {
  productos: 'Productos',
  categorias: 'Categorías',
  proveedores: 'Proveedores',
  usuarios: 'Usuarios',
  movimientos: 'Kardex',
};

export default function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  useEffect(() => {
    api.get('/auditoria')
      .then(({ data }) => setRegistros(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPaginaActual(1); }, [filtroTabla, filtroAccion, busqueda]);

  const registrosFiltrados = registros.filter((r) => {
    const coincideTabla = !filtroTabla || r.tabla_afectada === filtroTabla;
    const coincideAccion = !filtroAccion || r.accion === filtroAccion;
    const coincideBusqueda = !busqueda ||
      r.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
      (r.usuario_nombre || '').toLowerCase().includes(busqueda.toLowerCase());
    return coincideTabla && coincideAccion && coincideBusqueda;
  });

  const totalPaginas = Math.ceil(registrosFiltrados.length / porPagina) || 1;
  const registrosPagina = registrosFiltrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Auditoría</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por usuario o detalle..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <select
          value={filtroTabla}
          onChange={(e) => setFiltroTabla(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todas las secciones</option>
          {Object.entries(nombresTabla).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">Todas las acciones</option>
          <option value="crear">Crear</option>
          <option value="editar">Editar</option>
          <option value="eliminar">Eliminar</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium">Sección</th>
                  <th className="text-left px-4 py-3 font-medium">Acción</th>
                  <th className="text-left px-4 py-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {registrosPagina.map((r) => {
                  const { icon: Icon, color } = iconos[r.accion] || { icon: Pencil, color: 'text-slate-400' };
                  return (
                    <tr key={r.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-400">{new Date(r.created_at).toLocaleString('es-PE')}</td>
                      <td className="px-4 py-3">{r.usuario_nombre || 'Sistema'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                          {nombresTabla[r.tabla_afectada] || r.tabla_afectada}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
                          <Icon size={14} /> {r.accion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.detalle}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {registrosFiltrados.length === 0 && <p className="text-center text-slate-500 py-8">No hay registros que coincidan</p>}
          <Pagination paginaActual={paginaActual} totalPaginas={totalPaginas} onCambiar={setPaginaActual} />
        </div>
      )}
    </div>
  );
}