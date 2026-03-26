import { useState, useEffect } from 'react';
import { Users, Search, Plus, Pencil, Trash2, User, Mail, Phone, Shield } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';

export function Empleados() {
  const {
    data: empleados,
    loading,
    error,
    fetchData,
    setData
  } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);

  useEffect(() => {
    fetchData(() => api.empleados.getAll());
  }, []);

  const empleadosFiltrados = empleados?.filter(emp => 
    emp.nombre?.toLowerCase()?.includes(busqueda.toLowerCase()) || 
    emp.usuario?.toLowerCase()?.includes(busqueda.toLowerCase()) || 
    (emp.email || emp.correo)?.toLowerCase()?.includes(busqueda.toLowerCase())
  ) || [];
  const getRolBadge = rol => {
    let rolStr = String(rol || '').toLowerCase();
    // Mapa de id_rol a su respectivo texto si viene como número
    if (rolStr === '1') rolStr = 'administrador';
    if (rolStr === '2') rolStr = 'encargado';
    if (rolStr === '3') rolStr = 'empleado';
    
    switch (rolStr) {
      case 'administrador':
        return { color: 'bg-purple-100 text-purple-700', label: 'Administrador' };
      case 'encargado':
        return { color: 'bg-blue-100 text-blue-700', label: 'Encargado' };
      case 'empleado':
        return { color: 'bg-gray-100 text-gray-700', label: 'Empleado' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: rol || 'Desconocido' };
    }
  };
  const handleEditar = empleado => {
    setEmpleadoEditar(empleado);
    setMostrarModal(true);
  };
  const handleNuevo = () => {
    setEmpleadoEditar(null);
    setMostrarModal(true);
  };
  const handleEliminar = async id => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
      try {
        await api.empleados.delete(id);
        setData(empleados.filter(e => e.id !== id));
      } catch (err) {
        alert('Error al eliminar empleado: ' + err.message);
      }
    }
  };
  const handleGuardar = async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nuevoEmpleado = {
      nombre: formData.get('nombre'),
      usuario: formData.get('usuario'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      rol: formData.get('rol'),
      estado: 'activo'
    };
    try {
      if (empleadoEditar) {
        const updated = await api.empleados.update(empleadoEditar.id, nuevoEmpleado);
        setData(empleados.map(e => e.id === empleadoEditar.id ? updated : e));
      } else {
        const created = await api.empleados.create(nuevoEmpleado);
        setData([...empleados, created]);
      }
      setMostrarModal(false);
      setEmpleadoEditar(null);
    } catch (err) {
      alert('Error al guardar empleado: ' + err.message);
    }
  };
  const handleUsuarioChange = (e) => {
    const usr = e.target.value.trim().toLowerCase();
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
      if(!empleadoEditar) {
         emailInput.value = usr ? `${usr}@controlstock.com` : '';
      }
    }
  };

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[600px]"><LoadingSpinner size="lg" text="Cargando empleados..." /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => fetchData(() => api.empleados.getAll())} /></div>;

  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios y sus roles en el sistema</p>
        </div>
        <button onClick={handleNuevo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Agregar Empleado
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar empleados por nombre, usuario o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </div>

      {/* Información de roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Administrador</h3>
          </div>
          <p className="text-sm text-purple-700">Acceso total al sistema</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Encargado de Sucursal</h3>
          </div>
          <p className="text-sm text-blue-700">Gestión de inventario y reportes</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Empleado</h3>
          </div>
          <p className="text-sm text-gray-700">Registro de entradas y salidas</p>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo Electrónico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empleadosFiltrados.map((empleado, index) => {
              const rolBadge = getRolBadge(empleado.rol || empleado.id_rol);
              return <tr key={empleado.id_empleado || empleado.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{empleado.id_empleado || empleado.id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {empleado.nombre || 'Sin nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empleado.usuario || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {empleado.email || empleado.correo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {empleado.telefono || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${rolBadge?.color || 'bg-gray-100 text-gray-700'}`}>
                        {rolBadge?.label || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditar(empleado)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEliminar(empleado.id_empleado || empleado.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>

        {empleadosFiltrados.length === 0 && <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron empleados</p>
          </div>}
      </div>

      {/* Modal */}
      {mostrarModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {empleadoEditar ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input type="text" name="nombre" defaultValue={empleadoEditar?.nombre} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Ej: Juan Pérez" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input type="text" name="usuario" defaultValue={empleadoEditar?.usuario} onChange={handleUsuarioChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Ej: jperez" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input type="email" id="email-input" name="email" defaultValue={empleadoEditar?.email} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="correo@ejemplo.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" name="telefono" defaultValue={empleadoEditar?.telefono} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="55-1234-5678" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select name="rol" defaultValue={empleadoEditar?.rol} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required>
                  <option value="administrador">Administrador</option>
                  <option value="encargado">Encargado de Sucursal</option>
                  <option value="empleado">Empleado</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => {
              setMostrarModal(false);
              setEmpleadoEditar(null);
            }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}