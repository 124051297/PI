import { useEffect } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';
export function MobileDashboard() {
  const {
    user
  } = useAuth();
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
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Bienvenido</p>
            <h1 className="text-xl font-bold">{user?.nombre}</h1>
          </div>
          <button className="p-2 bg-blue-700 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
            <ArrowDownToLine className="w-6 h-6 mb-2" />
            <p className="text-2xl font-bold">{stats?.entradasHoy || 0}</p>
            <p className="text-xs opacity-90">Entradas hoy</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
            <ArrowUpFromLine className="w-6 h-6 mb-2" />
            <p className="text-2xl font-bold">{stats?.salidasHoy || 0}</p>
            <p className="text-xs opacity-90">Salidas hoy</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-6 space-y-4">
        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link to="/mobile/entrada" className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <ArrowDownToLine className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Registrar Entrada</p>
                <p className="text-xs text-gray-500">Agregar productos al inventario</p>
              </div>
            </Link>

            <Link to="/mobile/salida" className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <ArrowUpFromLine className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Registrar Salida</p>
                <p className="text-xs text-gray-500">Retirar productos del inventario</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Productos Bajo Stock */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Alerta de Stock</h2>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-2">
            {stats?.productosBajoStock.slice(0, 3).map(producto => <div key={producto.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">{producto.area}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{producto.stock} un.</span>
              </div>)}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowDownToLine className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Entrada registrada</p>
                <p className="text-xs text-gray-500">Cuadernos - 50 unidades</p>
                <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowUpFromLine className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Salida registrada</p>
                <p className="text-xs text-gray-500">Bolígrafos - 30 unidades</p>
                <p className="text-xs text-gray-400 mt-1">Hace 4 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de sincronización */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Sincronizado con el servidor</span>
        </div>
      </div>
    </div>;
}