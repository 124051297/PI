import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, Users, FileText, UserCog, Bell, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../hooks/useLogo';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const logoUrl = useLogo();
  const menuItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['administrador', 'encargado', 'empleado']
  }, {
    icon: Package,
    label: 'Productos',
    path: '/productos',
    roles: ['administrador', 'encargado']
  }, {
    icon: MapPin,
    label: 'Áreas',
    path: '/areas',
    roles: ['administrador', 'encargado']
  }, {
    icon: ArrowDownToLine,
    label: 'Entradas',
    path: '/entradas',
    roles: ['administrador', 'encargado', 'empleado']
  }, {
    icon: ArrowUpFromLine,
    label: 'Salidas',
    path: '/salidas',
    roles: ['administrador', 'encargado', 'empleado']
  }, {
    icon: Users,
    label: 'Empleados',
    path: '/empleados',
    roles: ['administrador']
  }, {
    icon: FileText,
    label: 'Reportes',
    path: '/reportes',
    roles: ['administrador', 'encargado']
  }, {
    icon: Bell,
    label: 'Notificaciones',
    path: '/notificaciones',
    roles: ['administrador', 'encargado', 'empleado']
  }, {
    icon: UserCog,
    label: 'Usuarios',
    path: '/usuarios',
    roles: ['administrador']
  }];

  // Filtrar elementos del menú según el rol del usuario
  const menuItemsFiltrados = menuItems.filter(item => user && item.roles.includes(user.rol));
  return <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {logoUrl ? (
             <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded" />
          ) : (
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
               <Package className="w-6 h-6 text-white" />
             </div>
          )}
          <div>
            <h1 className="font-bold text-lg text-gray-900">ControlStock</h1>
            <p className="text-xs text-gray-500">Papelería</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItemsFiltrados.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>;
      })}
      </nav>
    </div>;
}