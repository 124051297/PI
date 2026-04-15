import { useState, useEffect } from 'react';
import { ArrowDownToLine, Package, User, MapPin, Plus, Save, ShoppingCart, X } from 'lucide-react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';

export function Entradas() {
  const { data: areas, fetchData: fetchAreas } = useFetch();
  const { data: productos, fetchData: fetchProductos } = useFetch();
  const { data: empleados, fetchData: fetchEmpleados } = useFetch();
  const { data: entradas, fetchData: fetchEntradas } = useFetch();

  const { toasts, removeToast, success, error: showError } = useToast();
  const [guardando, setGuardando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [id_area, setIdArea] = useState('');
  const [id_empleado, setIdEmpleado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState([{ id_producto: '', cantidad: 1 }]);
  const formatDateTime = (value) => value ? new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value)) : 'Sin fecha';

  useEffect(() => {
    fetchAreas(() => api.areas.getAll());
    fetchProductos(() => api.productos.getAll());
    fetchEmpleados(() => api.empleados.getAll());
    fetchEntradas(() => api.entradas.getAll());
  }, []);

  const resetForm = () => {
    setIdArea('');
    setIdEmpleado('');
    setFecha(new Date().toISOString().split('T')[0]);
    setObservaciones('');
    setItems([{ id_producto: '', cantidad: 1 }]);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    resetForm();
  };

  const handleAddItem = () => {
    setItems([...items, { id_producto: '', cantidad: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.some((item) => !item.id_producto || Number(item.cantidad) < 1)) {
      showError('Por favor complete todos los campos de los productos');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        id_area: Number(id_area),
        id_empleado: Number(id_empleado),
        fecha,
        observaciones,
        items: items.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad)
        }))
      };

      await api.entradas.create(payload);
      success('Entrada(s) registrada(s) con éxito');
      await fetchEntradas(() => api.entradas.getAll());
      await fetchProductos(() => api.productos.getAll());
      cerrarModal();
    } catch (err) {
      showError(err.message || 'Error al registrar la entrada');
    } finally {
      setGuardando(false);
    }
  };

  return <div className="p-6 space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entradas de Inventario</h1>
          <p className="text-gray-500 mt-1">Registra la llegada de nuevos productos al inventario</p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-700">
          <Plus className="w-4 h-4" />
          Nueva Entrada
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Entradas Recientes</h2>
        {entradas?.length === 0 ? <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
            <p>No se han registrado entradas aún</p>
          </div> : <div className="space-y-4">
            {entradas?.slice(0, 10).map((entrada) => <div key={entrada.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded">#{entrada.id}</span>
                    <span className="text-sm font-medium text-gray-700">{formatDateTime(entrada.fecha)}</span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {entrada.area?.nombre}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {entrada.empleado?.nombre}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {entrada.detalles?.map((det, idx) => <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{det.producto?.nombre}</span>
                      </div>
                      <span className="font-bold text-green-600">+{det.cantidad} uds</span>
                    </div>)}
                  {entrada.observaciones && <p className="text-xs text-gray-400 mt-2 italic">"{entrada.observaciones}"</p>}
                </div>
              </div>)}
          </div>}
      </div>

      {mostrarModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center transition-all duration-300">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Nueva Entrada</h2>
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="space-y-4 pb-4 border-b border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área Destino *</label>
                  <select value={id_area} onChange={(e) => setIdArea(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Seleccionar área</option>
                    {areas?.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empleado Responsable *</label>
                  <select value={id_empleado} onChange={(e) => setIdEmpleado(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Seleccionar empleado</option>
                    {empleados?.map((emp) => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Productos a Ingresar
                  </h3>
                  <button type="button" onClick={handleAddItem} className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 font-bold">
                    <Plus className="w-3 h-3" /> Añadir otro
                  </button>
                </div>

                {items.map((item, index) => {
                const selectedProd = productos?.find((p) => String(p.id) === item.id_producto);
                return <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3 relative">
                    {items.length > 1 && <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Producto</label>
                        <select value={item.id_producto} onChange={(e) => handleItemChange(index, 'id_producto', e.target.value)} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none">
                          <option value="">Seleccionar...</option>
                          {productos?.map((producto) => <option key={producto.id} value={producto.id}>{producto.nombre}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ubicación Destino (Opcional)</label>
                        <select value={item.id_ubicacion || ''} onChange={(e) => handleItemChange(index, 'id_ubicacion', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none">
                          <option value="">Ubicación automática...</option>
                          {selectedProd?.ubicaciones_detalle?.map((u) => <option key={u.id_ubicacion} value={u.id_ubicacion}>
                              {u.codigo_ubicacion}
                            </option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cantidad</label>
                      <input type="number" min="1" value={item.cantidad} onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)} required className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                  </div>;
              })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" rows={2} placeholder="Notas adicionales..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-400">
                  <Save className="w-4 h-4" />
                  {guardando ? 'Procesando...' : 'Guardar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}
