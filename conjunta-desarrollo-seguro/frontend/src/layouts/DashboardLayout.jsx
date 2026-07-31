import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Truck, ArrowLeftRight, Users, History, Trash2, PackageSearch, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlobalSearch from '../components/GlobalSearch';
import { useTheme } from '../context/ThemeContext';
import ChatAsistente from '../components/ChatAsistente';

const linksBase = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/movimientos', label: 'Kardex', icon: ArrowLeftRight },
  { to: '/sin-movimiento', label: 'Sin Movimiento', icon: PackageSearch },
];

export default function DashboardLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [alertasStock, setAlertasStock] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { tema, toggleTema } = useTheme();
  const [ultimaSync, setUltimaSync] = useState(new Date());

  const links = usuario.rol === 'admin'
    ? [...linksBase, { to: '/usuarios', label: 'Usuarios', icon: Users }, { to: '/auditoria', label: 'Auditoría', icon: History }, { to: '/papelera', label: 'Papelera', icon: Trash2 }]
    : linksBase;

  useEffect(() => {
    const cargarAlertas = () => {
      api.get('/dashboard/alertas')
        .then(({ data }) => {
          setAlertasStock(data.total);
          setUltimaSync(new Date());
        })
        .catch(() => { });
    };
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const verificarSesion = () => {
      api.get('/auth/perfil').catch(() => { });
    };
    const intervalo = setInterval(verificarSesion, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const contenidoSidebar = (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">InvenTrack</h1>
          <p className="text-xs text-slate-500 mt-1 hidden lg:block">
            <kbd className="border border-slate-700 rounded px-1">Ctrl</kbd>+<kbd className="border border-slate-700 rounded px-1">K</kbd> buscar
          </p>
        </div>
        <button onClick={() => setMenuAbierto(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMenuAbierto(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            {to === '/productos' && alertasStock > 0 && (
              <span className="bg-amber-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {alertasStock}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavLink to="/perfil" onClick={() => setMenuAbierto(false)} className="block hover:opacity-80 transition-opacity">
          <p className="text-sm text-white font-medium">{usuario?.nombre}</p>
          <p className="text-xs text-slate-500 mb-3">{usuario?.rol}</p>
        </NavLink>
        <button onClick={toggleTema} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2">
          {tema === 'oscuro' ? <Sun size={16} /> : <Moon size={16} />}
          {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
        </button>
        <p className="text-[11px] text-slate-600 mb-2">
          Sincronizado {ultimaSync.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <GlobalSearch />

      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-bold text-white">InvenTrack</h1>
        <button onClick={() => setMenuAbierto(true)} className="text-slate-400 hover:text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay mobile */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        fixed lg:sticky top-0 left-0 z-50
        h-screen overflow-y-auto
        transform transition-transform lg:transform-none
        ${menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {contenidoSidebar}
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
      <ChatAsistente />
    </div>
  );
}