import { useState, useEffect } from 'react';
import { ArrowDownToLine, Calendar, Package, User, MapPin } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
export function Entradas() {
  const {
    data: areas,
    fetchData: fetchAreas
  } = useFetch();
  const {
    data: productos,
    fetchData: fetchProductos
  } = useFetch();
  const {
    data: entradas,
    fetchData: fetchEntradas,
    setData: setEntradas
  } = useFetch();
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    producto: '',
    cantidad: '',
    area: '',
    empleado: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAreas(() => api.areas.getAll());
    fetchProductos(() => api.productos.getAll());
    fetchEntradas(() => api.entradas.getAll());
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setGuardando(true);
    try {
      const nuevaEntrada = await api.entradas.create({
        id_producto: formData.producto,
        cantidad: parseInt(formData.cantidad),
        fecha: formData.fecha,
        // En un caso real, el usuario vendría del contexto de Auth
        id_usuario: 1 
      });
      setEntradas([nuevaEntrada, ...(entradas || [])]);
      setFormData({
        producto: '',
        cantidad: '',
        area: '',
        empleado: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      alert('Entrada registrada con éxito');
    } catch (err) {
      alert('Error al registrar la entrada');
    } finally {
      setGuardando(false);
    }
  };
  return <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entradas de Inventario</h1>
        <p className="text-gray-500 mt-1">Registra nuevas entradas de productos al inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de entrada */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Nueva Entrada</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Producto
                </div>
              </label>
              <select value={formData.producto} onChange={e => setFormData({
              ...formData,
              producto: e.target.value
            })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required>
                <option value="">Seleccionar producto</option>
                {productos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input type="number" value={formData.cantidad} onChange={e => setFormData({
              ...formData,
              cantidad: e.target.value
            })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" placeholder="0" min="1" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Área
                </div>
              </label>
              <select value={formData.area} onChange={e => setFormData({
              ...formData,
              area: e.target.value
            })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required>
                <option value="">Seleccionar área</option>
                {areas?.map(area => <option key={area.id} value={area.nombre}>{area.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Empleado
                </div>
              </label>
              <select value={formData.empleado} onChange={e => setFormData({
              ...formData,
              empleado: e.target.value
            })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required>
                <option value="">Seleccionar empleado</option>
                <option value="1">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha
                </div>
              </label>
              <input type="date" value={formData.fecha} onChange={e => setFormData({
              ...formData,
              fecha: e.target.value
            })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required />
            </div>

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-5 h-5" />
              Guardar Entrada
            </button>
          </form>
        </div>

        {/* Historial de entradas */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Entradas Recientes</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entradas?.map(entrada => <tr key={entrada.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">#{entrada.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {entrada.productos?.[0]?.producto?.nombre || 'Producto'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                        +{entrada.productos?.[0]?.cantidad || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">Almacén Central</td>
                    <td className="px-4 py-4 text-sm text-gray-900">Usuario #{entrada.id_usuario}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{entrada.fecha}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
}