import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Package, X, Filter, MapPin, ChevronDown, AlertTriangle } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { EmptyState } from './common/EmptyState';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';
import { useAuth } from '../context/AuthContext';

export function Productos() {
  const { data: productos, loading, error, fetchData, setData } = useFetch();
  const { data: areas, fetchData: fetchAreas } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const { toasts, removeToast, success, error: showError } = useToast();
  const { user } = useAuth();

  const cargarCatalogos = async () => {
    await Promise.all([
      fetchData(() => api.productos.getAll()),
      fetchAreas(() => api.areas.getAll())
    ]);
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const areasUnicas = useMemo(() => {
    if (!productos) return [];
    const set = new Set();
    productos.forEach((p) => {
      if (p.area && p.area !== 'Sin Area') set.add(p.area);
      p.ubicaciones_detalle?.forEach((u) => {
        if (u.area && u.area !== 'Sin Area') set.add(u.area);
      });
    });
    return [...set].sort();
  }, [productos]);

  const ubicacionesUnicas = useMemo(() => {
    if (!productos) return [];
    const set = new Set();
    productos.forEach((p) => {
      if (p.ubicacion && p.ubicacion !== 'Sin Ubicacion') set.add(p.ubicacion);
      p.ubicaciones_detalle?.forEach((u) => {
        if (u.codigo_ubicacion) set.add(u.codigo_ubicacion);
      });
    });
    return [...set].sort();
  }, [productos]);

  const ubicacionesFiltradas = useMemo(() => {
    if (!filtroArea || !productos) return ubicacionesUnicas;
    const set = new Set();
    productos.forEach((p) => {
      p.ubicaciones_detalle?.forEach((u) => {
        if (u.area === filtroArea && u.codigo_ubicacion) {
          set.add(u.codigo_ubicacion);
        }
      });
    });
    return [...set].sort();
  }, [filtroArea, productos, ubicacionesUnicas]);

  const productosFiltrados = productos?.filter((producto) => {
    const pNombre = producto?.nombre || '';
    const pArea = producto?.area || '';
    const pCodigo = producto?.codigo || '';
    const pUbicacion = producto?.ubicacion || '';
    const textoMatch =
      pNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pArea.toLowerCase().includes(busqueda.toLowerCase()) ||
      pCodigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      pUbicacion.toLowerCase().includes(busqueda.toLowerCase());

    const areaMatch =
      !filtroArea ||
      pArea === filtroArea ||
      producto.ubicaciones_detalle?.some((u) => u.area === filtroArea);

    const ubicacionMatch =
      !filtroUbicacion ||
      pUbicacion === filtroUbicacion ||
      producto.ubicaciones_detalle?.some((u) => u.codigo_ubicacion === filtroUbicacion);

    let stockMatch = true;
    if (filtroStock === 'critico') {
      stockMatch = producto.stock <= producto.stockMinimo * 0.5;
    } else if (filtroStock === 'bajo') {
      stockMatch = producto.stock < producto.stockMinimo;
    } else if (filtroStock === 'normal') {
      stockMatch = producto.stock >= producto.stockMinimo;
    }

    return textoMatch && areaMatch && ubicacionMatch && stockMatch;
  }) || [];

  const filtrosActivos = (filtroArea ? 1 : 0) + (filtroUbicacion ? 1 : 0) + (filtroStock !== 'todos' ? 1 : 0);

  const limpiarFiltros = () => {
    setFiltroArea('');
    setFiltroUbicacion('');
    setFiltroStock('todos');
    setBusqueda('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('Estas seguro de eliminar este producto? Esta accion no se puede deshacer.')) {
      return;
    }

    setEliminando(id);
    try {
      await api.productos.delete(id);
      setData(productos?.filter((p) => p.id !== id) || null);
      success('Producto eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'Error al eliminar el producto');
    } finally {
      setEliminando(null);
    }
  };

  const getDefaultAreaId = () => {
    if (!productoEditar) return '';
    return productoEditar.ubicaciones_detalle?.[0]?.id_area || areas?.find((area) => area.nombre === productoEditar.area)?.id || '';
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      nombre: formData.get('nombre'),
      stock: Number(formData.get('stock')),
      precio: Number(formData.get('precio')),
      stockMinimo: Number(formData.get('stockMinimo')),
      id_area: formData.get('id_area') ? Number(formData.get('id_area')) : null,
      codigo: formData.get('codigo') || null
    };

    try {
      if (productoEditar) {
        await api.productos.update(productoEditar.id, payload);
        success('Producto actualizado exitosamente');
      } else {
        await api.productos.create(payload);
        success('Producto creado exitosamente');
      }

      await fetchData(() => api.productos.getAll());
      setMostrarModal(false);
      setProductoEditar(null);
    } catch (err) {
      showError(err.message || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[600px]">
        <LoadingSpinner size="lg" text="Cargando productos..." />
      </div>;
  }

  if (error) {
    return <div className="p-6">
        <ErrorState message={error} onRetry={cargarCatalogos} />
      </div>;
  }

  return <div className="p-6 space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario de productos · {productosFiltrados.length} de {productos?.length || 0} productos</p>
        </div>
        {user?.rol === 'administrador' && <button onClick={() => {
        setProductoEditar(null);
        setMostrarModal(true);
      }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre, código, área o ubicación..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${mostrarFiltros || filtrosActivos > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filtros
            {filtrosActivos > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {filtrosActivos}
              </span>}
          </button>
        </div>

        {mostrarFiltros && <div className="pt-3 border-t border-gray-100 space-y-3 animate-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Área
                </label>
                <div className="relative">
                  <select value={filtroArea} onChange={(e) => {
                setFiltroArea(e.target.value);
                setFiltroUbicacion('');
              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white pr-8 text-sm">
                    <option value="">Todas las áreas</option>
                    {areasUnicas.map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Ubicacion
                </label>
                <div className="relative">
                  <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white pr-8 text-sm">
                    <option value="">Todas las ubicaciones</option>
                    {ubicacionesFiltradas.map((ubicacion) => <option key={ubicacion} value={ubicacion}>{ubicacion}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  <Package className="w-3.5 h-3.5 inline mr-1" />
                  Estado de Stock
                </label>
                <div className="relative">
                  <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white pr-8 text-sm">
                    <option value="todos">Todos los niveles</option>
                    <option value="normal">Stock normal</option>
                    <option value="bajo">Bajo stock</option>
                    <option value="critico">Stock critico</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filtrosActivos > 0 && <div className="flex justify-end">
                <button onClick={limpiarFiltros} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                  <X className="w-3.5 h-3.5" />
                  Limpiar todos los filtros
                </button>
              </div>}
          </div>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {productosFiltrados.length === 0 ? <EmptyState icon={Package} title="No hay productos" message="No se encontraron productos que coincidan con tu búsqueda" action={user?.rol === 'administrador' ? {
        label: 'Agregar primer producto',
        onClick: () => setMostrarModal(true)
      } : undefined} /> : <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                  {user?.rol === 'administrador' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosFiltrados.map((producto) => <>
                    <tr key={producto.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedRow === producto.id ? 'bg-blue-50/50' : ''}`} onClick={() => setExpandedRow(expandedRow === producto.id ? null : producto.id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{producto.codigo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${producto.stock < producto.stockMinimo ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {producto.stock < producto.stockMinimo ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Package className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                            {producto.stock < producto.stockMinimo && <p className="text-xs text-red-500 font-medium">Bajo stock</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${producto.stock < producto.stockMinimo * 0.5 ? 'bg-red-100 text-red-700' : producto.stock < producto.stockMinimo ? 'bg-orange-100 text-orange-700' : producto.stock < producto.stockMinimo * 1.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {producto.stock} uds
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(producto.precio).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.stockMinimo} uds</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                          {producto.area}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          <MapPin className="w-3 h-3" />
                          {producto.ubicacion}
                        </span>
                      </td>
                      {user?.rol === 'administrador' && <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {
                        setProductoEditar(producto);
                        setMostrarModal(true);
                      }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEliminar(producto.id)} disabled={eliminando === producto.id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                              {eliminando === producto.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>}
                    </tr>

                    {expandedRow === producto.id && producto.ubicaciones_detalle?.length > 0 && <tr key={`detail-${producto.id}`} className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
                        <td colSpan={user?.rol === 'administrador' ? 8 : 7} className="px-6 py-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              Detalle de ubicaciones ({producto.ubicaciones_detalle.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {producto.ubicaciones_detalle.map((ubicacion, index) => <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase">Area</p>
                                      <p className="text-sm font-medium text-gray-800">{ubicacion.area}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ubicacion.stock_en_ubicacion < producto.stockMinimo * 0.3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                      {ubicacion.stock_en_ubicacion} uds
                                    </span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-500">
                                    <div>
                                      <span className="font-medium text-gray-400">Pasillo</span>
                                      <p className="font-semibold text-gray-700">{ubicacion.pasillo}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-400">Estante</span>
                                      <p className="font-semibold text-gray-700">{ubicacion.estante}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-400">Nivel</span>
                                      <p className="font-semibold text-gray-700">{ubicacion.nivel}</p>
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <span className="inline-flex items-center gap-1 text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                      <MapPin className="w-3 h-3" />
                                      {ubicacion.codigo_ubicacion}
                                    </span>
                                  </div>
                                </div>)}
                            </div>
                          </div>
                        </td>
                      </tr>}
                  </>)}
              </tbody>
            </table>
          </div>}
      </div>

      {mostrarModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {productoEditar ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              <button onClick={() => {
            setMostrarModal(false);
            setProductoEditar(null);
          }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras / Manual</label>
                <input 
                  type="text" 
                  name="codigo"
                  defaultValue={productoEditar?.codigo} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  placeholder="Ej: 7501055300072 (O dejar vacío para auto-generar)" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" name="nombre" defaultValue={productoEditar?.nombre} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Ej: Cuaderno Profesional" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" name="stock" defaultValue={productoEditar?.stock ?? 0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="0" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" name="precio" step="0.01" defaultValue={productoEditar?.precio} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="0.00" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input type="number" name="stockMinimo" defaultValue={productoEditar?.stockMinimo} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="0" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area principal</label>
                  <select name="id_area" defaultValue={getDefaultAreaId()} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="">Seleccionar</option>
                    {areas?.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => {
              setMostrarModal(false);
              setProductoEditar(null);
            }} disabled={guardando} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
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
