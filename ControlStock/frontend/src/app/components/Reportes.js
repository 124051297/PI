import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';

export function Reportes() {
  const { loading, error } = useFetch();
  const [tipo, setTipo] = useState('mes');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [datos, setDatos] = useState(null);
  const [generando, setGenerando] = useState(false);

  const handleGenerar = async (e) => {
    e.preventDefault();
    setGenerando(true);
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reportes?tipo=${tipo}`;
    if (inicio) url += `&inicio=${inicio}`;
    if (fin) url += `&fin=${fin}`;
    
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const jsonData = await response.json();
      setDatos(jsonData);
    } catch(err) {
      alert("Error generating report");
    } finally {
      setGenerando(false);
    }
  };

  const exportCSV = () => {
    if(!datos) return;
    let csvStr = "TIPO,ENTIDAD,DETALLES,USUARIO,FECHA\n";
    datos.movimientos.forEach(row => {
        csvStr += `${row.accion},${row.entidad},"${row.detalles}",${row.usuario},${row.created_at}\n`;
    });
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const exportUrl = URL.createObjectURL(blob);
    link.setAttribute("href", exportUrl);
    link.setAttribute("download", `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if(!datos || !datos.movimientos) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Movimientos de Inventario', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ["Acción", "Entidad", "Detalles", "Usuario", "Fecha"];
    const tableRows = [];

    datos.movimientos.forEach(row => {
      const rowData = [
        row.accion,
        row.entidad,
        row.detalles,
        row.usuario,
        new Date(row.created_at).toLocaleString()
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`reporte_inventario_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Reportes</h1>
          <p className="text-gray-500 mt-1">Genera y descarga reportes del sistema.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleGenerar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="semana">Última Semana</option>
                    <option value="mes">Último Mes</option>
                    <option value="ano">Último Año</option>
                    <option value="especifico">Fecha Específica</option>
                    <option value="rango">Rango de Fechas</option>
                </select>
            </div>
            
            {(tipo === 'rango' || tipo === 'especifico') && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">{tipo === 'rango' ? 'Fecha Inicio' : 'Fecha'}</label>
                   <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
            )}

            {tipo === 'rango' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                   <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
            )}
            
            <div>
               <button type="submit" disabled={generando} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                  {generando ? 'Generando...' : 'Generar Reporte'}
               </button>
            </div>
        </form>
      </div>

      {datos && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Resultados del Reporte</h2>
                <div className="flex gap-2">
                   <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                      <Download className="w-4 h-4" /> Excel (CSV)
                   </button>
                   <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      <FileText className="w-4 h-4" /> PDF
                   </button>
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Se encontraron {datos.movimientos.length} movimientos en el periodo seleccionado.</p>
        </div>
      )}
    </div>
  );
}
