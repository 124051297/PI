import { useState, useEffect } from 'react';
import { History, Search } from 'lucide-react';

export function HistorialMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const formatDateTime = (value) => value ? new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value)) : 'Sin fecha';

  useEffect(() => {
    async function fetchData() {
       try {
           const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reportes?tipo=ano`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
           const jsonData = await response.json();
           setMovimientos(jsonData.movimientos || []);
       } catch (err) {
           console.error(err);
       } finally {
           setLoading(false);
       }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
          <p className="text-gray-500 mt-1">Registro completo de toda la actividad en el inventario</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>
        ) : movimientos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay movimientos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(mov.fecha)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mov.usuario}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${mov.accion === 'Crear' ? 'bg-green-100 text-green-800' : mov.accion === 'Eliminar' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {mov.accion}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mov.entidad}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{mov.detalles}</td>
                    </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
