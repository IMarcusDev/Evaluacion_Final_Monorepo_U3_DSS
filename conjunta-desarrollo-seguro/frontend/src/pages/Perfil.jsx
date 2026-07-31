import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const { usuario, actualizarNombreLocal } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');

  const handleNombre = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/perfil', { nombre });
      toast.success('Nombre actualizado');
      actualizarNombreLocal(nombre);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/perfil', { passwordActual, passwordNueva });
      toast.success('Contraseña actualizada');
      setPasswordActual('');
      setPasswordNueva('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Mi Perfil</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">Datos personales</h2>
        </div>
        <form onSubmit={handleNombre} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input
              value={usuario?.email}
              disabled
              className="w-full bg-slate-800/50 text-slate-500 rounded-lg px-3 py-2 text-sm border border-slate-700 cursor-not-allowed"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Guardar cambios
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Contraseña actual</label>
            <input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nueva contraseña</label>
            <input
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}