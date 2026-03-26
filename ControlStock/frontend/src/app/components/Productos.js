import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Package, X } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { EmptyState } from './common/EmptyState';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';
import { useAuth } from '../context/AuthContext';
export function Productos() {
  const {
    data: productos,
    loading,
    error,
    fetchData,
    setData
  } = useFetch();
  const {
    data: areas,
    fetchData: fetchAreas
  } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const {
    toasts,
    removeToast,
    success,
    error: showError
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    fetchData(() => api.productos.getAll());
  }, []);
  useEffect(() => {
    if (mostrarModal) {
      // Cargar áreas cuando se abre el modal
      fetchAreas(() => api.areas.getAll());
    }
  }, [mostrarModal]);
  const productosFiltrados = productos?.filter(producto => {
    const pNombre = producto?.nombre || '';
    const pArea = producto?.area || '';
    const pCodigo = producto?.codigo || '';
    return pNombre.toLowerCase().includes(busqueda.toLowerCase()) || 
           pArea.toLowerCase().includes(busqueda.toLowerCase()) || 
           pCodigo.toLowerCase().includes(busqueda.toLowerCase());
  }) || [];
  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }
    setEliminando(id);
    try {
      await api.productos.delete(id);
      setData(productos?.filter(p => p.id !== id) || null);
      success('Producto eliminado exitosamente');
    } catch (err) {
      showError('Error al eliminar el producto');
    } finally {
      setEliminando(null);
    }
  };
  const handleGuardar = async e => {
    e.preventDefault();
    setGuardando(true);
    const formData = new FormData(e.currentTarget);
    const nuevoProducto = {
      nombre: formData.get('nombre'),
      stock: parseInt(formData.get('stock')),
      precio: parseFloat(formData.get('precio')),
      stockMinimo: parseInt(formData.get('stockMinimo')),
      area: formData.get('area'),
      codigo: formData.get('codigo')
    };
    try {
      if (productoEditar) {
        const updated = await api.productos.update(productoEditar.id, nuevoProducto);
        setData(productos?.map(p => p.id === productoEditar.id ? updated : p) || null);
        success('Producto actualizado exitosamente');
      } else {
        const created = await api.productos.create(nuevoProducto);
        setData([...(productos || []), created]);
        success('Producto creado exitosamente');
      }
      setMostrarModal(false);
      setProductoEditar(null);
    } catch (err) {
      showError('Error al guardar el producto');
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
        <ErrorState message={error} onRetry={() => fetchData(() => api.productos.getAll())} />
      </div>;
  }
  return <div className="p-6 space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario de productos</p>
        </div>
        {user?.rol === 'administrador' && <button onClick={() => {
        setProductoEditar(null);
        setMostrarModal(true);
      }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>}
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar productos por nombre, código o área..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </div>

      {/* Tabla de productos */}
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
                  {user?.rol === 'administrador' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosFiltrados.map(producto => <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {producto.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${producto.stock < producto.stockMinimo ? 'bg-red-100 text-red-700' : producto.stock < producto.stockMinimo * 1.5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${producto.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stockMinimo} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {producto.area}
                      </span>
                    </td>
                    {user?.rol === 'administrador' && <td className="px-6 py-4 whitespace-nowrap">
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
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>

      {/* Modal de agregar/editar producto */}
      {mostrarModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Código del Producto</label>
                <input type="text" name="codigo" defaultValue={productoEditar?.codigo} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Ej: CUA-001" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" name="nombre" defaultValue={productoEditar?.nombre} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Ej: Cuaderno Profesional" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                  <input type="number" name="stock" defaultValue={productoEditar?.stock} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="0" min="0" required />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <select name="area" defaultValue={productoEditar?.area} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required>
                    <option value="">Seleccionar</option>
                    {areas?.map(area => <option key={area.id} value={area.nombre}>{area.nombre}</option>)}
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