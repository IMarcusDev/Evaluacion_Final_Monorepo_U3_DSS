import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
      <span className="text-xs text-slate-500">
        Página {paginaActual} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onCambiar(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onCambiar(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}