import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await api.notificaciones.getUnreadCount();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    };
    fetchCount();
    // Opcional: refrescar cada minuto
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Refrescar al cambiar de ruta
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const getRolLabel = rol => {
    switch (rol) {
      case 'administrador':
        return 'Administrador';
      case 'encargado':
        return 'Encargado de Sucursal';
      case 'personal':
        return 'Personal';
      default:
        return rol;
    }
  };
  return <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/notificaciones')} className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1 -translate-y-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button onClick={() => setMostrarMenu(!mostrarMenu)} className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                <p className="text-xs text-gray-500">{user && getRolLabel(user.rol)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border border-blue-200">
                {user?.foto_perfil ? (
                  <img src={user.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>

            {/* Menú desplegable */}
            {mostrarMenu && <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button onClick={() => {
              navigate('/configuracion');
              setMostrarMenu(false);
            }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
                <hr className="my-1" />
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>}
          </div>
        </div>
      </div>
    </header>;
}