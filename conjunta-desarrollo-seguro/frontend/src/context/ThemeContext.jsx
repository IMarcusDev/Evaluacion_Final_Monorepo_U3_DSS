import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'oscuro');

  useEffect(() => {
    document.documentElement.className = tema === 'claro' ? 'claro' : '';
    localStorage.setItem('tema', tema);
  }, [tema]);

  const toggleTema = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}