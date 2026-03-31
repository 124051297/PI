import { useState } from 'react';
import { FileText, Download, BarChart3, CalendarDays, Package, ClipboardList } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';

export function Reportes() {
  const [tipo, setTipo] = useState('mes');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [datos, setDatos] = useState(null);
  const [generando, setGenerando] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  const handleGenerar = async (e) => {
    e.preventDefault();
    setGenerando(true);

    try {
      const reportData = await api.reportes.get({ tipo, inicio, fin });
      setDatos(reportData);
      success('Reporte generado correctamente');
    } catch (err) {
      showError(err.message || 'Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!datos) return;

    const movimientosRows = datos.movimientos.map((row) => `
      <tr>
        <td>${row.accion}</td>
        <td>${row.entidad}</td>
        <td>${row.detalles}</td>
        <td>${row.usuario}</td>
        <td>${row.fecha}</td>
      </tr>
    `).join('');

    const inventarioRows = datos.inventario.map((item) => `
      <tr>
        <td>${item.codigo}</td>
        <td>${item.nombre}</td>
        <td>${item.categoria}</td>
        <td>${item.stock}</td>
        <td>${item.stock_minimo}</td>
        <td>$${Number(item.precio).toFixed(2)}</td>
        <td>${item.area}</td>
        <td>${item.ubicacion}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #1f2937; }
            h1, h2 { color: #111827; }
            .meta, .summary { margin-bottom: 16px; }
            .summary td { padding: 8px 12px; border: 1px solid #d1d5db; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #1d4ed8; color: white; padding: 10px; border: 1px solid #d1d5db; }
            td { padding: 8px; border: 1px solid #d1d5db; vertical-align: top; }
          </style>
        </head>
        <body>
          <h1>Reporte Ejecutivo ControlStock</h1>
          <div class="meta">
            <p><strong>Periodo:</strong> ${datos.periodo_label}</p>
            <p><strong>Fecha de generacion:</strong> ${datos.fecha_generacion}</p>
          </div>
          <table class="summary">
            <tr><td><strong>Total movimientos</strong></td><td>${datos.summary.total_movimientos}</td></tr>
            <tr><td><strong>Total entradas</strong></td><td>${datos.summary.total_entradas}</td></tr>
            <tr><td><strong>Total salidas</strong></td><td>${datos.summary.total_salidas}</td></tr>
            <tr><td><strong>Productos bajo stock</strong></td><td>${datos.summary.productos_bajo_stock}</td></tr>
          </table>
          <h2>Movimientos</h2>
          <table>
            <thead>
              <tr>
                <th>Accion</th>
                <th>Entidad</th>
                <th>Detalles</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>${movimientosRows || '<tr><td colspan="5">Sin movimientos registrados.</td></tr>'}</tbody>
          </table>
          <h2>Inventario Actual</h2>
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Stock</th>
                <th>Minimo</th>
                <th>Precio</th>
                <th>Area</th>
                <th>Ubicacion</th>
              </tr>
            </thead>
            <tbody>${inventarioRows || '<tr><td colspan="8">Sin productos registrados.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `;

    downloadFile(html, `reporte_controlstock_${new Date().toISOString().split('T')[0]}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    success('Reporte Excel descargado');
  };

  const exportPDF = () => {
    if (!datos) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFillColor(29, 78, 216);
    doc.rect(0, 0, doc.internal.pageSize.width, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Reporte Ejecutivo ControlStock', 40, 42);
    doc.setFontSize(10);
    doc.text(`Periodo: ${datos.periodo_label}`, 40, 62);
    doc.text(`Generado: ${datos.fecha_generacion}`, 40, 76);

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.text(`Movimientos: ${datos.summary.total_movimientos}`, 40, 120);
    doc.text(`Entradas: ${datos.summary.total_entradas}`, 180, 120);
    doc.text(`Salidas: ${datos.summary.total_salidas}`, 300, 120);
    doc.text(`Bajo stock: ${datos.summary.productos_bajo_stock}`, 420, 120);

    autoTable(doc, {
      startY: 140,
      head: [['Accion', 'Entidad', 'Detalles', 'Usuario', 'Fecha']],
      body: datos.movimientos.map((row) => [row.accion, row.entidad, row.detalles, row.usuario, row.fecha]),
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216] },
      styles: { fontSize: 9, cellPadding: 6 },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Pagina ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 20);
      }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 24,
      head: [['Codigo', 'Producto', 'Categoria', 'Stock', 'Minimo', 'Precio', 'Area', 'Ubicacion']],
      body: datos.inventario.map((item) => [
        item.codigo,
        item.nombre,
        item.categoria,
        item.stock,
        item.stock_minimo,
        `$${Number(item.precio).toFixed(2)}`,
        item.area,
        item.ubicacion
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] },
      styles: { fontSize: 8, cellPadding: 5 }
    });

    doc.save(`reporte_controlstock_${new Date().toISOString().split('T')[0]}.pdf`);
    success('Reporte PDF descargado');
  };

  return <div className="p-6 space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modulo de Reportes</h1>
          <p className="text-gray-500 mt-1">Genera reportes ejecutivos y descargas profesionales del sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleGenerar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="semana">Ultima Semana</option>
              <option value="mes">Ultimo Mes</option>
              <option value="ano">Ultimo Ano</option>
              <option value="especifico">Fecha Especifica</option>
              <option value="rango">Rango de Fechas</option>
            </select>
          </div>

          {(tipo === 'rango' || tipo === 'especifico') && <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tipo === 'rango' ? 'Fecha Inicio' : 'Fecha'}</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>}

          {tipo === 'rango' && <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>}

          <div>
            <button type="submit" disabled={generando} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {generando ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </form>
      </div>

      {datos && <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Movimientos</p>
                  <p className="text-2xl font-bold text-gray-900">{datos.summary.total_movimientos}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entradas</p>
                  <p className="text-2xl font-bold text-gray-900">{datos.summary.total_entradas}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salidas</p>
                  <p className="text-2xl font-bold text-gray-900">{datos.summary.total_salidas}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bajo Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{datos.summary.productos_bajo_stock}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Resultados del Reporte</h2>
                <p className="text-sm text-gray-500">Periodo: {datos.periodo_label} · Generado: {datos.fecha_generacion}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  <Download className="w-4 h-4" /> Excel
                </button>
                <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Movimientos Recientes</h3>
                </div>
                <div className="overflow-auto max-h-[420px]">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Accion</th>
                        <th className="px-3 py-2 text-left">Entidad</th>
                        <th className="px-3 py-2 text-left">Usuario</th>
                        <th className="px-3 py-2 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.movimientos.map((row) => <tr key={row.id} className="border-b border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-900">{row.accion}</td>
                          <td className="px-3 py-2 text-gray-600">{row.entidad}</td>
                          <td className="px-3 py-2 text-gray-600">{row.usuario}</td>
                          <td className="px-3 py-2 text-gray-600">{row.fecha}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Inventario Actual</h3>
                </div>
                <div className="overflow-auto max-h-[420px]">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-600 text-white sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Codigo</th>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-left">Stock</th>
                        <th className="px-3 py-2 text-left">Minimo</th>
                        <th className="px-3 py-2 text-left">Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.inventario.map((item) => <tr key={item.codigo} className="border-b border-gray-100">
                          <td className="px-3 py-2 font-mono text-gray-600">{item.codigo}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{item.nombre}</td>
                          <td className="px-3 py-2 text-gray-600">{item.stock}</td>
                          <td className="px-3 py-2 text-gray-600">{item.stock_minimo}</td>
                          <td className="px-3 py-2 text-gray-600">{item.area}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}
