import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Productos } from './components/Productos';
import { Entradas } from './components/Entradas';
import { Salidas } from './components/Salidas';
import { Empleados } from './components/Empleados';
import { Notificaciones } from './components/Notificaciones';
import { Configuracion } from './components/Configuracion';
import { PlaceholderPage } from './components/PlaceholderPage';
import { Areas } from './components/Areas';
import { Usuarios } from './components/Usuarios';
import { Reportes } from './components/Reportes';
import { HistorialMovimientos } from './components/HistorialMovimientos';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FileText, UserCog } from 'lucide-react';

// Mobile Components
import { MobileLayout } from './components/mobile/MobileLayout';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { MobileEntrada } from './components/mobile/MobileEntrada';
import { MobileSalida } from './components/mobile/MobileSalida';
import { MobileProductos } from './components/mobile/MobileProductos';
import { MobilePerfil } from './components/mobile/MobilePerfil';
function MainLayout({
  children
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.rol === 'empleado') return <Navigate to="/mobile/dashboard" replace />;
  
  return <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16">{children}</main>
      </div>
    </div>;
}

// Component to redirect based on user role
function RoleBasedRedirect() {
  const {
    user
  } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Empleados usan la versión móvil
  if (user.rol === 'empleado') {
    return <Navigate to="/mobile/dashboard" replace />;
  }

  // Admin y Encargado usan la versión web
  return <Navigate to="/dashboard" replace />;
}
function MobileProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.rol !== 'empleado') return <Navigate to="/dashboard" replace />;
  return <MobileLayout>{children}</MobileLayout>;
}

function AppRoutes() {
  return <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/redirect" element={<RoleBasedRedirect />} />
      
      {/* Web Routes (Admin & Encargado) */}
      <Route path="/dashboard" element={<MainLayout>
            <Dashboard />
          </MainLayout>} />
      <Route path="/productos" element={<MainLayout>
            <Productos />
          </MainLayout>} />
      <Route path="/entradas" element={<MainLayout>
            <Entradas />
          </MainLayout>} />
      <Route path="/salidas" element={<MainLayout>
            <Salidas />
          </MainLayout>} />
      <Route path="/empleados" element={<MainLayout>
            <Empleados />
          </MainLayout>} />
      <Route path="/reportes" element={<MainLayout>
            <Reportes />
          </MainLayout>} />
      <Route path="/historial" element={<MainLayout>
            <HistorialMovimientos />
          </MainLayout>} />
      <Route path="/notificaciones" element={<MainLayout>
            <Notificaciones />
          </MainLayout>} />
      <Route path="/configuracion" element={<MainLayout>
            <Configuracion />
          </MainLayout>} />
      <Route path="/usuarios" element={<MainLayout>
            <Usuarios />
          </MainLayout>} />
      <Route path="/areas" element={<MainLayout>
            <Areas />
          </MainLayout>} />

      {/* Mobile Routes (Empleado) */}
      <Route path="/mobile/dashboard" element={<MobileProtectedLayout>
            <MobileDashboard />
          </MobileProtectedLayout>} />
      <Route path="/mobile/entrada" element={<MobileProtectedLayout>
            <MobileEntrada />
          </MobileProtectedLayout>} />
      <Route path="/mobile/salida" element={<MobileProtectedLayout>
            <MobileSalida />
          </MobileProtectedLayout>} />
      <Route path="/mobile/productos" element={<MobileProtectedLayout>
            <MobileProductos />
          </MobileProtectedLayout>} />
      <Route path="/mobile/perfil" element={<MobileProtectedLayout>
            <MobilePerfil />
          </MobileProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>;
}
export default function App() {
  return <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>;
}