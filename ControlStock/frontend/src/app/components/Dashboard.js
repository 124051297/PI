import { useEffect } from 'react';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { ConnectionIndicator } from './common/ConnectionIndicator';
export function Dashboard() {
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
    return <div className="p-6 flex items-center justify-center min-h-[600px]">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>;
  }
  if (error) {
    return <div className="p-6">
        <ErrorState message={error} onRetry={() => fetchData(() => api.dashboard.getStats())} />
      </div>;
  }
  if (!stats) return null;
  const statsCards = [{
    icon: Package,
    title: 'Total Productos',
    value: (stats.totalProductos || 0).toLocaleString(),
    change: '+12%',
    changeType: 'positive',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  }, {
    icon: AlertTriangle,
    title: 'Productos con Bajo Stock',
    value: (stats.bajoStock || 0).toString(),
    change: '-5%',
    changeType: 'positive',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  }, {
    icon: ArrowDownToLine,
    title: 'Entradas del Día',
    value: (stats.entradasHoy || 0).toString(),
    change: '+8%',
    changeType: 'positive',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  }, {
    icon: ArrowUpFromLine,
    title: 'Salidas del Día',
    value: (stats.salidasHoy || 0).toString(),
    change: '+3%',
    changeType: 'positive',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  }];
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al sistema de gestión de inventario</p>
        </div>
        <ConnectionIndicator />
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} vs mes anterior
                  </span>
                </div>
                <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>;
      })}
      </div>

      {/* Gráfica de inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Movimientos de Inventario</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Datos en tiempo real</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.movimientos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="entradas" stroke="#2563eb" strokeWidth={3} />
              <Line type="monotone" dataKey="salidas" stroke="#dc2626" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Salidas</span>
            </div>
          </div>
        </div>

        {/* Productos con bajo stock */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Proporción de Stock</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.pieData || []}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(stats.pieData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Productos Bajo Stock</h3>
            {stats.productosBajoStock.map((product, index) => <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                  <p className="text-xs text-gray-500">{product.area}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-600">
                    {product.stock}
                  </span>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {(stats.actividadReciente || []).length === 0 ? (
            <p className="text-sm text-gray-500">No hay actividad reciente.</p>
          ) : (
             (stats.actividadReciente || []).map((actividad, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 border-l-4 rounded ${
                  actividad.accion === 'Crear' ? 'border-green-500 bg-green-50' : 
                  actividad.accion === 'Eliminar' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                }`}>
                  {actividad.accion === 'Crear' ? <ArrowDownToLine className="w-5 h-5 text-green-600" /> : 
                   actividad.accion === 'Eliminar' ? <ArrowUpFromLine className="w-5 h-5 text-red-600" /> : 
                   <Package className="w-5 h-5 text-blue-600" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{actividad.entidad} - {actividad.accion}</p>
                    <p className="text-xs text-gray-500">{actividad.detalles} ({actividad.usuario})</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(actividad.created_at).toLocaleString()}</span>
                </div>
             ))
          )}
        </div>
      </div>
    </div>;
}