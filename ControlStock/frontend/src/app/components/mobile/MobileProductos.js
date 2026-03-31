import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Package, Search, AlertTriangle, MapPin, Filter, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';
export function MobileProductos() {
  const navigate = useNavigate();
  const {
    data: productos,
    loading,
    error,
    fetchData
  } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');

  useEffect(() => {
    fetchData(() => api.productos.getAll());
  }, []);

  const areasUnicas = useMemo(() => {
    if (!productos) return [];
    const set = new Set();
    productos.forEach(p => {
      if (p.area && p.area !== 'Sin Área') set.add(p.area);
    });
    return [...set].sort();
  }, [productos]);

  const productosFiltrados = productos?.filter(producto => {
    const nombre = producto.nombre_producto || producto.nombre || '';
    const codigo = producto.id_producto?.toString() || producto.codigo || '';
    const area = producto.area || '';
    const ubicacion = producto.ubicacion || '';
    const textoMatch = nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      area.toLowerCase().includes(busqueda.toLowerCase()) ||
      ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    
    const areaMatch = !filtroArea || area === filtroArea ||
      producto.ubicaciones_detalle?.some(u => u.area === filtroArea);
    
    const stock = Number(producto.stock || 0);
    const minStock = Number(producto.stock_minimo || producto.stockMinimo || 0);
    let stockMatch = true;
    if (filtroStock === 'bajo') stockMatch = stock < minStock;
    else if (filtroStock === 'normal') stockMatch = stock >= minStock;
    else if (filtroStock === 'critico') stockMatch = stock <= minStock * 0.5;

    return textoMatch && areaMatch && stockMatch;
  }) || [];

  const filtrosActivos = (filtroArea ? 1 : 0) + (filtroStock !== 'todos' ? 1 : 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando productos..." />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen p-4">
        <ErrorState message={error} onRetry={() => fetchData(() => api.productos.getAll())} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/mobile/dashboard')} className="p-2 hover:bg-blue-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Package className="w-6 h-6" />
            <h1 className="text-lg font-bold">Productos</h1>
          </div>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`p-2 rounded-lg relative ${mostrarFiltros ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <Filter className="w-5 h-5" />
            {filtrosActivos > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
          <input type="text" placeholder="Buscar por nombre, código, área..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-blue-700 border border-blue-500 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white" />
        </div>

        {/* Filtros móviles */}
        {mostrarFiltros && (
          <div className="mt-3 pt-3 border-t border-blue-500 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Área</label>
                <select 
                  value={filtroArea}
                  onChange={e => setFiltroArea(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-500 rounded-lg text-white text-sm focus:outline-none"
                >
                  <option value="">Todas</option>
                  {areasUnicas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Stock</label>
                <select 
                  value={filtroStock}
                  onChange={e => setFiltroStock(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-700 border border-blue-500 rounded-lg text-white text-sm focus:outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="normal">Normal</option>
                  <option value="bajo">Bajo</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>
            </div>
            {filtrosActivos > 0 && (
              <button 
                onClick={() => { setFiltroArea(''); setFiltroStock('todos'); }}
                className="text-xs text-blue-200 hover:text-white flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de productos */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            {productosFiltrados.length} de {productos?.length || 0} producto{productosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {productosFiltrados.map(producto => {
          const nombre = producto.nombre_producto || producto.nombre;
          const codigo = producto.id_producto || producto.codigo;
          const precio = Number(producto.precio_unitario || producto.precio || 0);
          const stock = Number(producto.stock || 0);
          const minStock = Number(producto.stock_minimo || producto.stockMinimo || 0);
          const area = producto.area || 'Sin Área';
          const ubicacion = producto.ubicacion || 'Sin Ubicación';
          
          return (
          <div key={producto.id_producto || producto.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stock < minStock ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {stock < minStock 
                      ? <AlertTriangle className="w-5 h-5 text-red-600" />
                      : <Package className="w-5 h-5 text-blue-600" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{nombre}</p>
                    <p className="text-xs text-gray-500 font-mono">#{codigo}</p>
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">${precio.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className={`p-3 rounded-lg ${stock < minStock ? 'bg-red-50 border border-red-200' : stock < minStock * 1.5 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-xs text-gray-600 mb-1">Stock Actual</p>
                <p className={`text-lg font-bold ${stock < minStock ? 'text-red-700' : stock < minStock * 1.5 ? 'text-orange-700' : 'text-green-700'}`}>
                  {stock}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Stock Mínimo</p>
                <p className="text-lg font-bold text-gray-900">{minStock}</p>
              </div>
            </div>

            {/* Área y Ubicación */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                {area}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                <MapPin className="w-3 h-3" />
                {ubicacion}
              </span>
              {stock < minStock && <div className="flex items-center gap-1 text-red-600 ml-auto">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-medium text-xs">Stock bajo</span>
                </div>}
            </div>
          </div>
        )})}

        {productosFiltrados.length === 0 && <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>}
      </div>
    </div>;
}