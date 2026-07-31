import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Movimientos from './pages/Movimientos';
import NotFound from './pages/NotFound';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Auditoria from './pages/Auditoria';
import { ThemeProvider } from './context/ThemeContext';
import Papelera from './pages/Papelera';
import SinMovimiento from './pages/SinMovimiento';
import ProductoDetalle from './pages/ProductoDetalle';

function RutaProtegida({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RutaProtegida>
            <DashboardLayout />
          </RutaProtegida>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/papelera" element={<Papelera />} />
        <Route path="/sin-movimiento" element={<SinMovimiento />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        }} />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;