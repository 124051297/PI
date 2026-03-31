import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Check, Clock, Plus, X, Send } from 'lucide-react';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';

export function Notificaciones() {
  const { loading, fetchData } = useFetch();
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuariosDestino, setUsuariosDestino] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [formState, setFormState] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'info',
    destinatario: ''
  });
  const { toasts, removeToast, success, error: showError } = useToast();

  const esAdmin = user?.rol === 'administrador';

  const cargarNotificaciones = async () => {
    const data = await fetchData(() => api.notificaciones.getAll());
    if (data) {
      setNotificaciones(data);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  useEffect(() => {
    if (!esAdmin) {
      return;
    }

    api.usuarios.getAll()
      .then((data) => {
        setUsuariosDestino((data || []).filter((item) => item.rol !== 'administrador'));
      })
      .catch((err) => {
        console.error('Error al cargar usuarios destino', err);
      });
  }, [esAdmin]);

  const notificacionesFiltradas = notificaciones.filter((n) => filtro === 'todas' ? true : !n.leida);
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = async (id) => {
    try {
      await api.notificaciones.update(id, { leida: true });
      setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
    } catch (err) {
      console.error('Error al marcar como leida', err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await api.notificaciones.markAllAsRead();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error al marcar todas', err);
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await api.notificaciones.delete(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormState({
      titulo: '',
      mensaje: '',
      tipo: 'info',
      destinatario: ''
    });
  };

  const handleCrearNotificacion = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await api.notificaciones.create({
        titulo: formState.titulo.trim(),
        mensaje: formState.mensaje.trim(),
        tipo: formState.tipo,
        para_todos: formState.destinatario === 'todos',
        id_usuarios: formState.destinatario && formState.destinatario !== 'todos' ? [Number(formState.destinatario)] : []
      });

      success('Notificacion enviada correctamente');
      cerrarModal();
      await cargarNotificaciones();
    } catch (err) {
      showError(err.message || 'Error al crear la notificacion');
    } finally {
      setGuardando(false);
    }
  };

  const getIcono = (tipo) => {
    switch (tipo) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'error':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  if (loading && notificaciones.length === 0) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando notificaciones..." />
      </div>;
  }

  return <div className="p-6 max-w-5xl mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {noLeidas > 0 ? `Tienes ${noLeidas} notificacion${noLeidas > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {noLeidas > 0 && <button onClick={marcarTodasComoLeidas} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Check className="w-4 h-4" />
              Marcar todas como leidas
            </button>}
          {esAdmin && <button onClick={() => setMostrarModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Nueva notificacion
            </button>}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFiltro('todas')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filtro === 'todas' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          Todas ({notificaciones.length})
        </button>
        <button onClick={() => setFiltro('no-leidas')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filtro === 'no-leidas' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          Sin leer ({noLeidas})
        </button>
      </div>

      <div className="space-y-4">
        {notificacionesFiltradas.length === 0 ? <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No hay notificaciones para mostrar</p>
          </div> : notificacionesFiltradas.map((notificacion) => {
        const { icon: Icono, color, bg } = getIcono(notificacion.tipo);
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
                        {new Date(notificacion.fecha).toLocaleString('es-MX')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notificacion.mensaje}</p>
                    {esAdmin && <p className="text-xs text-gray-400 mb-3">
                        Destinatario: {notificacion.destinatario || 'General'}
                      </p>}
                    <div className="flex items-center gap-4">
                      {!notificacion.leida && <button onClick={() => marcarComoLeida(notificacion.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Marcar como leida
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

      {mostrarModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Crear notificacion</h2>
                <p className="text-sm text-gray-500">Enviala a todos los empleados o a un usuario especifico</p>
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearNotificacion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                <input type="text" value={formState.titulo} onChange={(e) => setFormState((prev) => ({ ...prev, titulo: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Actualizacion de inventario" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea value={formState.mensaje} onChange={(e) => setFormState((prev) => ({ ...prev, mensaje: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]" placeholder="Escribe el mensaje que veran los empleados..." required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={formState.tipo} onChange={(e) => setFormState((prev) => ({ ...prev, tipo: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="info">Informativa</option>
                    <option value="success">Exito</option>
                    <option value="warning">Advertencia</option>
                    <option value="error">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
                  <select value={formState.destinatario} onChange={(e) => setFormState((prev) => ({ ...prev, destinatario: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Seleccionar destinatario</option>
                    <option value="todos">Todos los empleados</option>
                    {usuariosDestino.map((usuario) => <option key={usuario.id_usuario || usuario.id} value={usuario.id_usuario || usuario.id}>
                        {usuario.empleado?.nombre || usuario.nombre_usuario} ({usuario.nombre_usuario})
                      </option>)}
                  </select>
                </div>
              </div>

              {formState.destinatario === 'todos' && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Esta opcion envia la notificacion a todos los empleados.
                </div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {guardando ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}
