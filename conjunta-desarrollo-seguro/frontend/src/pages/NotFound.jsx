import { useNavigate } from 'react-router-dom';
import { PackageX } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <PackageX size={64} className="text-slate-600 mb-6" />
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">La página que buscas no existe o fue movida.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Volver al Dashboard
      </button>
    </div>
  );
}