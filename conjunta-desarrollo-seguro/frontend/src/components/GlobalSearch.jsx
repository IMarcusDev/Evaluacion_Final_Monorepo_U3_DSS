import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Tags, Truck, LayoutDashboard, ArrowLeftRight, Users, History, User } from 'lucide-react';
import api from '../services/api';

const paginas = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Productos', path: '/productos', icon: Package },
  { label: 'Categorías', path: '/categorias', icon: Tags },
  { label: 'Proveedores', path: '/proveedores', icon: Truck },
  { label: 'Kardex', path: '/movimientos', icon: ArrowLeftRight },
  { label: 'Usuarios', path: '/usuarios', icon: Users },
  { label: 'Auditoría', path: '/auditoria', icon: History },
  { label: 'Mi Perfil', path: '/perfil', icon: User },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && productos.length === 0) {
      api.get('/productos').then(({ data }) => setProductos(data)).catch(() => {});
    }
  }, [open]);

  const paginasFiltradas = paginas.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
  const productosFiltrados = query.length > 0
    ? productos.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const ir = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 px-4 z-[100]" onClick={() => setOpen(false)}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search size={18} className="text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas o productos..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          <kbd className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {paginasFiltradas.length > 0 && (
            <div className="px-2 mb-1">
              <p className="text-xs text-slate-500 px-2 py-1">Páginas</p>
              {paginasFiltradas.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => ir(path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          )}

          {productosFiltrados.length > 0 && (
            <div className="px-2">
              <p className="text-xs text-slate-500 px-2 py-1">Productos</p>
              {productosFiltrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => ir('/productos')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Package size={16} />
                  <span className="flex-1 text-left">{p.nombre}</span>
                  <span className="text-xs text-slate-500">{p.sku}</span>
                </button>
              ))}
            </div>
          )}

          {query && paginasFiltradas.length === 0 && productosFiltrados.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-6">Sin resultados</p>
          )}
        </div>
      </div>
    </div>
  );
}