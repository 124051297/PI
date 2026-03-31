import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Check, Clock } from 'lucide-react';
import { LoadingSpinner } from './common/LoadingSpinner';

export function Notificaciones() {
  const { data: rawNotificaciones, loading, fetchData } = useFetch();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'no-leidas'

  useEffect(() => {
    fetchData(() => api.notificaciones.getAll()).then(data => {
      if(data) setNotificaciones(data);
    });
  }, []);

  const notificacionesFiltradas = notificaciones.filter(n => filtro === 'todas' ? true : !n.leida);
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeida = async id => {
    try {
      await api.notificaciones.update(id, { leida: true });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (err) {
      console.error("Error al marcar como leída", err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await api.notificaciones.markAllAsRead();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error("Error al marcar todas", err);
    }
  };

  const eliminarNotificacion = async id => {
    try {
      await api.notificaciones.delete(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };

  const getIcono = tipo => {
    switch (tipo) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bg: 'bg-orange-100'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-100'
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bg: 'bg-blue-100'
        };
    }
  };

  if (loading && notificaciones.length === 0) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando notificaciones..." />
      </div>;
  }

  return <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
          </p>
        </div>
        {noLeidas > 0 && <button onClick={marcarTodasComoLeidas} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </button>}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFiltro('todas')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filtro === 'todas' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          Todas ({notificaciones.length})
        </button>
        <button onClick={() => setFiltro('no-leidas')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filtro === 'no-leidas' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          Sin leer ({noLeidas})
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {notificacionesFiltradas.length === 0 ? <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No hay notificaciones para mostrar</p>
          </div> : notificacionesFiltradas.map(notificacion => {
        const {
          icon: Icono,
          color,
          bg
        } = getIcono(notificacion.tipo);
        return <div key={notificacion.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${notificacion.leida ? 'border-gray-200 opacity-75' : 'border-blue-200 bg-blue-50/30'}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icono className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-gray-900 truncate ${!notificacion.leida ? 'text-blue-900' : ''}`}>
                        {notificacion.titulo}
                        {!notificacion.leida && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(notificacion.fecha || notificacion.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notificacion.mensaje}</p>
                    <div className="flex items-center gap-4">
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