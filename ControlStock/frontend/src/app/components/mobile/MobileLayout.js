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
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 max-w-[390px] mx-auto z-50 pb-6 pt-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <button 
                key={item.path} 
                onClick={() => navigate(item.path)} 
                className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all duration-300 relative group ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50 rounded-2xl -z-10 animate-scale"></div>
                )}
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-sm' : 'group-active:scale-90'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </button>;
        })}
        </div>
      </nav>
    </div>;
}