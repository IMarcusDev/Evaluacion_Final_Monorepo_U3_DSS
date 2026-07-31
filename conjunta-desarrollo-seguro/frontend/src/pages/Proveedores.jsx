import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import TableSkeleton from '../components/TableSkeleton';

export default function Proveedores() {
  const { usuario } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/proveedores');
    setProveedores(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });
    setModalOpen(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/proveedores/${editando.id}`, form);
        toast.success('Proveedor actualizado');
      } else {
        await api.post('/proveedores', form);
        toast.success('Proveedor creado');
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/proveedores/${confirmDelete.id}`);
      toast.success('Proveedor eliminado');
      setConfirmDelete(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Proveedores</h1>
        {usuario.rol === 'admin' && (
          <button onClick={abrirNuevo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Nuevo Proveedor
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800 text-white hover:bg-slate-800/30">
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-400">{p.contacto || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.telefono || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.email || '—'}</td>
                    <td className="px-4 py-3">
                      {usuario.rol === 'admin' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => abrirEditar(p)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {proveedores.length === 0 && <p className="text-center text-slate-500 py-8">No hay proveedores registrados</p>}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['nombre', 'contacto', 'telefono', 'email', 'direccion'].map((campo) => (
                <div key={campo}>
                  <label className="text-xs text-slate-400 mb-1 block capitalize">{campo}</label>
                  <input
                    value={form[campo]}
                    onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                    required={campo === 'nombre'}
                    className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 mt-2 transition-colors">
                {editando ? 'Guardar Cambios' : 'Crear Proveedor'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar proveedor"
        message={`¿Seguro que quieres eliminar "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}