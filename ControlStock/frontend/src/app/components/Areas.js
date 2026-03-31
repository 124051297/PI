import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, MapPin, X, Calendar } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { EmptyState } from './common/EmptyState';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';

export function Areas() {
  const {
    data: areas,
    loading,
    error,
    fetchData,
    setData
  } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [areaEditar, setAreaEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const {
    toasts,
    removeToast,
    success,
    error: showError
  } = useToast();

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    fetchData(() => api.areas.getAll());
  }, []);

  const areasFiltradas = areas?.filter(area => 
    area.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  // Calcular paginación
  const totalPaginas = Math.ceil(areasFiltradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const areasPaginadas = areasFiltradas.slice(indiceInicio, indiceFin);

  const handleEliminar = async id => {
    const area = areas.find(a => (a.id_area || a.id) === id);
    if (!window.confirm(`¿Estás seguro de eliminar el área "${area?.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setEliminando(id);
    try {
      await api.areas.delete(id);
      setData(areas?.filter(a => (a.id_area || a.id) !== id) || null);
      success('Área eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'Error al eliminar el área');
    } finally {
      setEliminando(null);
    }
  };

  const handleGuardar = async e => {
    e.preventDefault();
    setGuardando(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      nombre: formData.get('nombre'),
      pasillo: formData.get('pasillo'),
      estante: formData.get('estante'),
      nivel: formData.get('nivel')
    };

    // Validación
    if (!payload.nombre.trim()) {
      showError('El nombre del área es requerido');
      setGuardando(false);
      return;
    }

    try {
      if (areaEditar) {
        const areaId = areaEditar.id_area || areaEditar.id;
        const updated = await api.areas.update(areaId, payload);
        setData(areas?.map(a => (a.id_area || a.id) === areaId ? { ...a, ...updated } : a) || null);
        success('Área actualizada exitosamente');
      } else {
        const created = await api.areas.create(payload);
        setData([...(areas || []), created]);
        success('Área creada exitosamente');
      }
      cerrarModal();
    } catch (err) {
      showError(err.message || 'Error al guardar el área');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEditar = async area => {
    try {
      // Obtener detalle completo incluyendo ubicación inicial
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/areas/${area.id_area || area.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      const fullData = await response.json();
      setAreaEditar(fullData);
      setMostrarModal(true);
    } catch (err) {
      setAreaEditar(area);
      setMostrarModal(true);
    }
  };

  const abrirModalNuevo = () => {
    setAreaEditar(null);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAreaEditar(null);
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[600px]">
        <LoadingSpinner size="lg" text="Cargando áreas..." />
      </div>;
  }

  if (error) {
    return <div className="p-6">
        <ErrorState message="Error al cargar las áreas" onRetry={() => fetchData(() => api.areas.getAll())} />
      </div>;
  }

  return <div className="p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Áreas</h1>
        <p className="text-gray-600">Administra las áreas y sus ubicaciones en el almacén</p>
      </div>

      {/* Barra de acciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar áreas..." value={busqueda} onChange={e => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Agregar Área
          </button>
        </div>
      </div>

      {/* Tabla */}
      {areasFiltradas.length === 0 ? <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <EmptyState icon={MapPin} message={busqueda ? 'No se encontraron áreas' : 'No hay áreas registradas'} description={busqueda ? 'Intenta con otro término de búsqueda' : 'Comienza agregando una nueva área'} />
        </div> : <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del Área
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {areasPaginadas.map(area => {
                    const areaId = area.id_area || area.id;
                    return <tr key={areaId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{areaId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{area.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {area.fecha_creacion ? new Date(area.fecha_creacion).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'No disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => abrirModalEditar(area)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEliminar(areaId)} disabled={eliminando === areaId} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Eliminar">
                            {eliminando === areaId ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, areasFiltradas.length)} de {areasFiltradas.length} áreas
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                    <button key={num} onClick={() => setPaginaActual(num)} className={`px-4 py-2 rounded-lg transition-colors ${paginaActual === num ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                      {num}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>}
        </>}

      {/* Modal para agregar/editar */}
      {mostrarModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {areaEditar ? 'Editar Área' : 'Nueva Área'}
                </h2>
                {areaEditar?.fecha_creacion && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    Creado el {new Date(areaEditar.fecha_creacion).toLocaleString()}
                  </p>
                )}
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGuardar}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Área *
                  </label>
                  <input type="text" id="nombre" name="nombre" defaultValue={areaEditar?.nombre} required placeholder="Ej: Papelería, Bodega..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación inicial {areaEditar ? '(Actualizar)' : ''}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="pasillo" className="block text-xs font-medium text-gray-500 mb-1">Pasillo</label>
                      <input type="text" id="pasillo" name="pasillo" defaultValue={areaEditar?.ubicacion_inicial?.pasillo} placeholder="Ej: A, B, 1..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="estante" className="block text-xs font-medium text-gray-500 mb-1">Estante</label>
                        <input type="text" id="estante" name="estante" defaultValue={areaEditar?.ubicacion_inicial?.estante} placeholder="Ej: 1, 2..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label htmlFor="nivel" className="block text-xs font-medium text-gray-500 mb-1">Nivel / Altura</label>
                        <input type="text" id="nivel" name="nivel" defaultValue={areaEditar?.ubicacion_inicial?.nivel} placeholder="Ej: 1, PB..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button type="button" onClick={cerrarModal} disabled={guardando} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {guardando ? <>
                      <LoadingSpinner size="sm" />
                      Guardando...
                    </> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}