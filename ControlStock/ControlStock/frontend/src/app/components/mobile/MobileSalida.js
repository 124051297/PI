import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpFromLine, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
export function MobileSalida() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    data: productos,
    fetchData,
    setData
  } = useFetch();
  const {
    data: areas,
    fetchData: fetchAreas
  } = useFetch();
  const [guardando, setGuardando] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const {
    toasts,
    removeToast,
    success,
    error: showError
  } = useToast();
  const [formData, setFormData] = useState({
    productoId: '',
    cantidad: '',
    area: ''
  });
  useEffect(() => {
    fetchData(() => api.productos.getAll());
    fetchAreas(() => api.areas.getAll());
  }, []);
  useEffect(() => {
    if (formData.productoId && productos) {
      const producto = productos.find(p => p.id === parseInt(formData.productoId));
      setProductoSeleccionado(producto);
    } else {
      setProductoSeleccionado(null);
    }
  }, [formData.productoId, productos]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.productoId || !formData.cantidad || !formData.area) {
      showError('Por favor completa todos los campos');
      return;
    }
    const cantidad = parseInt(formData.cantidad);

    // Validar stock
    if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
      showError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock} unidades`);
      return;
    }
    setGuardando(true);
    try {
      const producto = productos?.find(p => p.id === parseInt(formData.productoId));
      await api.salidas.create({
        productoId: formData.productoId,
        producto: producto?.nombre,
        cantidad: cantidad,
        area: formData.area,
        empleado: user?.nombre
      });

      // Actualizar stock localmente
      if (productos) {
        const updatedProductos = productos.map(p => p.id === parseInt(formData.productoId) ? {
          ...p,
          stock: p.stock - cantidad
        } : p);
        setData(updatedProductos);
      }
      setExitoVisible(true);
      success('Salida registrada exitosamente');

      // Reset form
      setFormData({
        productoId: '',
        cantidad: '',
        area: ''
      });
      setProductoSeleccionado(null);
      setTimeout(() => {
        setExitoVisible(false);
      }, 3000);
    } catch (err) {
      showError('Error al registrar la salida');
    } finally {
      setGuardando(false);
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mobile/dashboard')} className="p-2 hover:bg-red-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="w-6 h-6" />
            <h1 className="text-lg font-bold">Registrar Salida</h1>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {exitoVisible && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Salida Registrada!</h2>
            <p className="text-gray-600">La salida se ha guardado correctamente</p>
          </div>
        </div>}

      {/* Form */}
      <div className="p-4 space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-900">
            <strong>Importante:</strong> Verifica el stock disponible antes de registrar la salida. No se puede retirar más de lo disponible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                Producto
              </div>
            </label>
            <select value={formData.productoId} onChange={e => setFormData({
            ...formData,
            productoId: e.target.value,
            cantidad: ''
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white" required disabled={guardando}>
              <option value="">Seleccionar producto</option>
              {productos?.map(producto => <option key={producto.id} value={producto.id}>
                  {producto.codigo} - {producto.nombre} (Stock: {producto.stock})
                </option>)}
            </select>
          </div>

          {/* Stock Info */}
          {productoSeleccionado && <div className={`rounded-xl p-4 ${productoSeleccionado.stock < productoSeleccionado.stockMinimo ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {productoSeleccionado.stock < productoSeleccionado.stockMinimo && <AlertTriangle className="w-4 h-4 text-red-600" />}
                <p className="text-sm font-semibold text-gray-900">Stock Disponible</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{productoSeleccionado.stock} unidades</p>
              <p className="text-xs text-gray-600 mt-1">Stock mínimo: {productoSeleccionado.stockMinimo} unidades</p>
            </div>}

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cantidad a Retirar
            </label>
            <input type="number" value={formData.cantidad} onChange={e => setFormData({
            ...formData,
            cantidad: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg font-semibold" placeholder="0" min="1" max={productoSeleccionado?.stock || undefined} required disabled={guardando || !productoSeleccionado} />
            {productoSeleccionado && formData.cantidad && parseInt(formData.cantidad) > productoSeleccionado.stock && <p className="text-xs text-red-600 mt-2">La cantidad excede el stock disponible</p>}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Área de Procedencia
            </label>
            <select value={formData.area} onChange={e => setFormData({
            ...formData,
            area: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white" required disabled={guardando}>
              <option value="">Seleccionar área</option>
              {areas?.map(area => <option key={area.id} value={area.nombre}>
                  {area.nombre}
                </option>)}
            </select>
          </div>

          <button type="submit" disabled={guardando || !productoSeleccionado} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
            {guardando ? <>
                <LoadingSpinner size="sm" />
                Registrando...
              </> : <>
                <ArrowUpFromLine className="w-5 h-5" />
                Registrar Salida
              </>}
          </button>
        </form>

        {/* Employee Info */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-600">Registrado por</p>
          <p className="text-sm font-semibold text-gray-900">{user?.nombre}</p>
        </div>
      </div>
    </div>;
}