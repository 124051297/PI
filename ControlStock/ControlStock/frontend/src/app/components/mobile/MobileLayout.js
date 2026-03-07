import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ArrowDownToLine, ArrowUpFromLine, User } from 'lucide-react';
export function MobileLayout({
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [{
    icon: Home,
    label: 'Inicio',
    path: '/mobile/dashboard'
  }, {
    icon: ArrowDownToLine,
    label: 'Entrada',
    path: '/mobile/entrada'
  }, {
    icon: ArrowUpFromLine,
    label: 'Salida',
    path: '/mobile/salida'
  }, {
    icon: Package,
    label: 'Productos',
    path: '/mobile/productos'
  }, {
    icon: User,
    label: 'Perfil',
    path: '/mobile/perfil'
  }];
  return <div className="min-h-screen bg-gray-50 pb-20 max-w-[390px] mx-auto">
      {/* Content */}
      <main className="min-h-[calc(100vh-80px)]">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-[390px] mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>;
        })}
        </div>
      </nav>
    </div>;
}