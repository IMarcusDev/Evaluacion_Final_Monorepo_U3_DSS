import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../services/api';

export default function ChatAsistente() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: 'Hola, soy el asistente de InvenTrack. Pregúntame sobre tu inventario.' }
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const pregunta = input;
    setMensajes((prev) => [...prev, { rol: 'user', texto: pregunta }]);
    setInput('');
    setCargando(true);

    try {
      const { data } = await api.post('/asistente/preguntar', { mensaje: pregunta });
      setMensajes((prev) => [...prev, { rol: 'bot', texto: data.respuesta }]);
    } catch {
      setMensajes((prev) => [...prev, { rol: 'bot', texto: 'Hubo un error al procesar tu pregunta.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg z-50 transition-colors"
      >
        {abierto ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
            <Bot size={18} className="text-indigo-400" />
            <span className="text-white font-medium text-sm">Asistente InvenTrack</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                  m.rol === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 rounded-xl px-3 py-2 text-sm">Pensando...</div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={enviar} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre tu inventario..."
              className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}