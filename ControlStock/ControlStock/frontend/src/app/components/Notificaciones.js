import { useState, useEffect } from 'react';
import { Bell, Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, CheckCheck, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';

export function Notificaciones() {
  const { data: rawNotificaciones, loading, fetchData } = useFetch();
  const [notificaciones, setNotificaciones] = useState([]);
  
  useEffect(() => {
    fetchData(() => api.notificaciones.getAll()).then(data => {
      if(data) setNotificaciones(data);
    });
  }, []);
  const [filtro, setFiltro] = useState('todas');
  const notificacionesFiltradas = notificaciones.filter(n => filtro === 'todas' ? true : !n.leida);
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const marcarComoLeida = id => {
    setNotificaciones(prev => prev.map(n => n.id === id ? {
      ...n,
      leida: true
    } : n));
  };
  const marcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({
      ...n,
      leida: true
    })));
  };
  const eliminarNotificacion = id => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };
  const getIcono = tipo => {
    switch (tipo) {
      case 'warning':
        return {
          Icon: AlertTriangle,
          color: 'text-orange-600',
          bg: 'bg-orange-100'
        };
      case 'success':
        return {
          Icon: ArrowDownToLine,
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'alert':
        return {
          Icon: ArrowUpFromLine,
          color: 'text-red-600',
          bg: 'bg-red-100'
        };
      default:
        return {
          Icon: Package,
          color: 'text-blue-600',
          bg: 'bg-blue-100'
        };
    }
  };
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-500 mt-1">
            {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
          </p>
        </div>
        {noLeidas > 0 && <button onClick={marcarTodasLeidas} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <CheckCheck className="w-5 h-5" />
            Marcar todas como leídas
          </button>}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex gap-2">
          <button onClick={() => setFiltro('todas')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === 'todas' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            Todas ({notificaciones.length})
          </button>
          <button onClick={() => setFiltro('noLeidas')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === 'noLeidas' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            No leídas ({noLeidas})
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {notificacionesFiltradas.length === 0 ? <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay notificaciones para mostrar</p>
          </div> : notificacionesFiltradas.map(notificacion => {
        const {
          Icon,
          color,
          bg
        } = getIcono(notificacion.tipo);
        return <div key={notificacion.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${notificacion.leida ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'}`}>
                <div className="flex items-start gap-4">
                  <div className={`${bg} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notificacion.titulo}
                        {!notificacion.leida && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notificacion.fecha}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notificacion.mensaje}</p>

                    <div className="flex items-center gap-2">
                      {!notificacion.leida && <button onClick={() => marcarComoLeida(notificacion.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Marcar como leída
                        </button>}
                      <button onClick={() => eliminarNotificacion(notificacion.id)} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>;
      })}
      </div>
    </div>;
}