import { useEffect } from 'react';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';

export function MobileDashboard() {
  const { user } = useAuth();
  const {
    data: stats,
    loading,
    error,
    fetchData
  } = useFetch();

  useEffect(() => {
    fetchData(() => api.dashboard.getStats());
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>;
  }

  if (error) {
    return <div className="p-4">
        <ErrorState message={error} onRetry={() => fetchData(() => api.dashboard.getStats())} />
      </div>;
  }

  return <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Móvil</h1>
            <p className="text-blue-100 text-xs">Gestión de Inventario - {user?.nombre}</p>
          </div>
          <button className="p-2 bg-blue-700 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <ArrowDownToLine className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Entradas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.entradasHoy || 0}</p>
            <p className="text-[10px] text-gray-500">registradas hoy</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <ArrowUpFromLine className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Salidas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.salidasHoy || 0}</p>
            <p className="text-[10px] text-gray-500">registradas hoy</p>
          </div>
        </div>

        {/* Acciones de Trabajo */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/mobile/entrada" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-900">Registrar Entrada</span>
          </Link>
          <Link to="/mobile/salida" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
              <ArrowUpFromLine className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-900">Registrar Salida</span>
          </Link>
        </div>

        {/* Alerta de Productos con Bajo Stock (Individual) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Productos con Bajo Stock</h2>
            <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold">
              {stats?.bajoStock || 0} ALERTAS
            </div>
          </div>
          
          <div className="space-y-3">
            {stats?.productosBajoStock && stats.productosBajoStock.length > 0 ? (
              stats.productosBajoStock.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{producto.nombre}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{producto.area || 'Sin Área'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-600">{producto.stock_actual || producto.stock}</span>
                    <p className="text-[10px] text-gray-500">unid. actuales</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-green-50 rounded-lg border border-green-100 border-dashed">
                <Package className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-green-800 uppercase">Sin Alertas</p>
                <p className="text-[10px] text-green-600">Todo el stock está en niveles normales</p>
              </div>
            )}
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-4">Actividad del Sistema</h2>
          <div className="space-y-4">
            {(stats?.actividadReciente || []).length > 0 ? (
              stats.actividadReciente.slice(0, 5).map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    act.accion === 'Crear' ? 'bg-green-100 text-green-600' : 
                    act.accion === 'Eliminar' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {act.accion === 'Crear' ? <ArrowDownToLine className="w-4 h-4" /> : 
                     act.accion === 'Eliminar' ? <ArrowUpFromLine className="w-4 h-4" /> : 
                     <Package className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{act.entidad} - {act.accion}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{act.detalles}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                       {formatDistanceToNow(new Date(act.created_at || act.fecha), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-400 py-4 italic">No hay actividad reciente.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="px-6 py-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">En línea</span>
        </div>
      </div>
    </div>;
}