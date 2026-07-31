import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { exportarDashboardPDF } from '../utils/exportar';
import { FileText } from 'lucide-react';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const [valorPorCategoria, setValorPorCategoria] = useState([]);

  useEffect(() => {
    api.get('/dashboard/metricas')
      .then(({ data }) => setMetricas(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    api.get('/dashboard/valor-por-categoria')
      .then(({ data }) => setValorPorCategoria(data.map(d => ({ ...d, valor: Number(d.valor) }))))
      .catch(() => { });
  }, []);

  const cargarDatosDemo = async () => {
    setCargandoDemo(true);
    try {
      await api.post('/seed/cargar-demo');
      toast.success('Datos demo cargados');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar datos demo');
    } finally {
      setCargandoDemo(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Cargando...</div>;
  if (!metricas) return <div className="p-8 text-red-400">Error al cargar métricas</div>;

  const cards = [
    { label: 'Valor de Inventario', value: `S/ ${Number(metricas.valor_inventario).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Productos', value: metricas.total_productos, icon: Package, color: 'text-indigo-400' },
    { label: 'Unidades en Stock', value: metricas.total_unidades, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Stock Bajo', value: metricas.productos_stock_bajo.length, icon: AlertTriangle, color: 'text-amber-400' },
  ];

  const datosTendencia = {};
  metricas.movimientos_por_dia.forEach((m) => {
    const fecha = new Date(m.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    if (!datosTendencia[fecha]) datosTendencia[fecha] = { fecha, entrada: 0, salida: 0 };
    datosTendencia[fecha][m.tipo] = Number(m.cantidad);
  });
  const tendenciaArray = Object.values(datosTendencia);

  const COLORES = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];


  return (
    <div className="p-8" id="dashboard-contenido" key={loading ? 'loading' : 'loaded'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2 no-exportar">
          <button
            onClick={() => exportarDashboardPDF('dashboard-contenido', 'dashboard-inventrack')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FileText size={16} /> Exportar PDF
          </button>
          {usuario.rol === 'admin' && metricas.total_productos <= 3 && (
            <button
              onClick={cargarDatosDemo}
              disabled={cargandoDemo}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {cargandoDemo ? 'Cargando...' : 'Cargar datos demo'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in" style={{ animationDelay: '240ms' }}>
          <h2 className="text-white font-semibold mb-4">Productos más movidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricas.productos_mas_movidos}>
              <XAxis dataKey="nombre" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(0, 10)} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="total_movido" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-white font-semibold mb-4">Productos con stock bajo</h2>
          {metricas.productos_stock_bajo.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay productos con stock bajo 🎉</p>
          ) : (
            <ul className="space-y-2">
              {metricas.productos_stock_bajo.map((p) => (
                <li key={p.id} className="flex justify-between items-center bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-white">{p.nombre}</span>
                  <span className="text-xs text-amber-400 font-medium">{p.stock_actual} / {p.stock_minimo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in" style={{ animationDelay: '360ms' }}>
          <h2 className="text-white font-semibold mb-4">Entradas vs Salidas (últimos 30 días)</h2>
          {tendenciaArray.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay movimientos registrados en este periodo</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tendenciaArray}>
                <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="entrada" stroke="#10b981" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="salida" stroke="#ef4444" strokeWidth={2} name="Salidas" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 fade-in overflow-visible" style={{ animationDelay: '420ms' }}>
          <h2 className="text-white font-semibold mb-4">Valor de inventario por categoría</h2>
          {valorPorCategoria.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay datos suficientes</p>
          ) : (
            <>
              <div className="no-exportar">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={valorPorCategoria}
                      dataKey="valor"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                    >
                      {valorPorCategoria.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                      formatter={(value) => `S/ ${Number(value).toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="solo-exportar hidden">
                <ul className="space-y-2">
                  {valorPorCategoria.map((c, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: COLORES[i % COLORES.length] }} />
                        {c.categoria}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">S/ {c.valor.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}