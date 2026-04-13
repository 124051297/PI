import { useState, useEffect } from 'react';
import { UserCog, Search, Shield, Key, History, Trash2, Edit, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';
import { LoadingSpinner } from './common/LoadingSpinner';

export function Usuarios() {
  const { data: usuarios, loading, fetchData, setData } = useFetch();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tab, setTab] = useState('lista'); // 'lista' | 'bitacora'
  const [busqueda, setBusqueda] = useState('');
  const { toasts, removeToast, success, error: showError } = useToast();

  const [mostrarModalPass, setMostrarModalPass] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [nuevaPass, setNuevaPass] = useState('');
  const [guardando, setGuardando] = useState(false);
  const formatDateTime = (value) => value ? new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value)) : 'N/A';

  useEffect(() => {
    fetchData(() => api.usuarios.getAll());
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/bitacora`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error("Error al cargar logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const usuariosFiltrados = usuarios?.filter(u => 
    u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.empleado?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  const handleCambiarPass = async (e) => {
    e.preventDefault();
    if (nuevaPass.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setGuardando(true);
    try {
      await api.usuarios.update(usuarioEditar.id_usuario || usuarioEditar.id, {
        password: nuevaPass
      });
      success('Contraseña actualizada correctamente');
      setMostrarModalPass(false);
      setNuevaPass('');
    } catch (err) {
      showError('Error al actualizar contraseña');
    } finally {
      setGuardando(false);
    }
  };

  if (loading && !usuarios) return <div className="p-6 flex justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Usuarios y Sistema</h1>
          <p className="text-gray-500 mt-1">Gestiona accesos y supervisa la actividad global</p>
        </div>
        
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button 
            onClick={() => setTab('lista')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'lista' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setTab('bitacora')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'bitacora' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Bitácora
          </button>
        </div>
      </div>

      {tab === 'lista' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por usuario o nombre..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Empleado Asignado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Última Modificación</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuariosFiltrados.map(user => (
                  <tr key={user.id_usuario || user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">{user.nombre_usuario}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.empleado?.nombre} {user.empleado?.ap}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.empleado?.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.empleado?.rol || 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDateTime(user.ultima_modificacion)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setUsuarioEditar(user); setMostrarModalPass(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cambiar Contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Eventos Recientes del Sistema
            </h3>
            <button onClick={cargarLogs} className="text-sm text-blue-600 hover:underline">Refrescar</button>
          </div>
          
          {loadingLogs ? (
            <div className="p-12 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Acción realizada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.id} className="text-sm">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.fecha)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {log.usuario}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className={`font-bold ${log.accion.includes('Eliminar') ? 'text-red-600' : log.accion.includes('Crear') ? 'text-green-600' : 'text-blue-600'}`}>
                          {log.accion}
                        </span>
                        {log.detalles && <span className="text-gray-400 ml-2">({log.detalles})</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Cambio Password */}
      {mostrarModalPass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <Key className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold">Cambiar Contraseña</h2>
            </div>
            
            <form onSubmit={handleCambiarPass} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Cambiarás la contraseña para el usuario <span className="font-bold text-gray-900">{usuarioEditar?.nombre_usuario}</span>.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={nuevaPass}
                  onChange={e => setNuevaPass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setMostrarModalPass(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={guardando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {guardando ? <LoadingSpinner size="sm" /> : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
