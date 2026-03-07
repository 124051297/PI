import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowDownToLine, Package, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
export function MobileEntrada() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    data: productos,
    fetchData
  } = useFetch();
  const {
    data: areas,
    fetchData: fetchAreas
  } = useFetch();
  const [guardando, setGuardando] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);
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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.productoId || !formData.cantidad || !formData.area) {
      showError('Por favor completa todos los campos');
      return;
    }
    setGuardando(true);
    try {
      const producto = productos?.find(p => p.id === parseInt(formData.productoId));
      await api.entradas.create({
        productoId: formData.productoId,
        producto: producto?.nombre,
        cantidad: parseInt(formData.cantidad),
        area: formData.area,
        empleado: user?.nombre
      });
      setExitoVisible(true);
      success('Entrada registrada exitosamente');

      // Reset form
      setFormData({
        productoId: '',
        cantidad: '',
        area: ''
      });
      setTimeout(() => {
        setExitoVisible(false);
      }, 3000);
    } catch (err) {
      showError('Error al registrar la entrada');
    } finally {
      setGuardando(false);
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mobile/dashboard')} className="p-2 hover:bg-green-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6" />
            <h1 className="text-lg font-bold">Registrar Entrada</h1>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {exitoVisible && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm animate-scale">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Entrada Registrada!</h2>
            <p className="text-gray-600">La entrada se ha guardado correctamente</p>
          </div>
        </div>}

      {/* Form */}
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Registra las entradas de productos al inventario. Asegúrate de verificar el producto y la cantidad.
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
            productoId: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white" required disabled={guardando}>
              <option value="">Seleccionar producto</option>
              {productos?.map(producto => <option key={producto.id} value={producto.id}>
                  {producto.codigo} - {producto.nombre} (Stock: {producto.stock})
                </option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cantidad a Ingresar
            </label>
            <input type="number" value={formData.cantidad} onChange={e => setFormData({
            ...formData,
            cantidad: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-lg font-semibold" placeholder="0" min="1" required disabled={guardando} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Área de Almacenamiento
            </label>
            <select value={formData.area} onChange={e => setFormData({
            ...formData,
            area: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white" required disabled={guardando}>
              <option value="">Seleccionar área</option>
              {areas?.map(area => <option key={area.id} value={area.nombre}>
                  {area.nombre}
                </option>)}
            </select>
          </div>

          <button type="submit" disabled={guardando} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
            {guardando ? <>
                <LoadingSpinner size="sm" />
                Registrando...
              </> : <>
                <ArrowDownToLine className="w-5 h-5" />
                Registrar Entrada
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