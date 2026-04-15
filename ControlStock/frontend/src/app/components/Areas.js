import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, MapPin, X, Calendar, Layers3, QrCode, Printer, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useFetch } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorState } from './common/ErrorState';
import { EmptyState } from './common/EmptyState';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';

const emptyUbicacion = { pasillo: '', estante: '', nivel: '' };

export function Areas() {
  const { data: areas, loading, error, fetchData, setData } = useFetch();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [areaEditar, setAreaEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [formState, setFormState] = useState({ nombre: '' });
  const [ubicaciones, setUbicaciones] = useState([{ ...emptyUbicacion }]);
  const { toasts, removeToast, success, error: showError } = useToast();
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;
  const [modalQrArea, setModalQrArea] = useState(null);
  const [copiado, setCopiado] = useState(null);
  const printRef = useRef(null);

  const cargarAreas = async () => {
    await fetchData(() => api.areas.getAll());
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  useEffect(() => {
    if (!mostrarModal) return;

    setFormState({ nombre: areaEditar?.nombre || '' });

    const ubicacionesIniciales = areaEditar?.ubicaciones?.length
      ? areaEditar.ubicaciones.map((ubicacion) => ({
          id_ubicacion: ubicacion.id_ubicacion,
          pasillo: ubicacion.pasillo || '',
          estante: ubicacion.estante || '',
          nivel: ubicacion.nivel || ''
        }))
      : areaEditar?.ubicacion_inicial
        ? [{
            id_ubicacion: areaEditar.ubicacion_inicial.id_ubicacion,
            pasillo: areaEditar.ubicacion_inicial.pasillo || '',
            estante: areaEditar.ubicacion_inicial.estante || '',
            nivel: areaEditar.ubicacion_inicial.nivel || ''
          }]
        : [{ ...emptyUbicacion }];

    setUbicaciones(ubicacionesIniciales.length ? ubicacionesIniciales : [{ ...emptyUbicacion }]);
  }, [mostrarModal, areaEditar]);

  const areasFiltradas = areas?.filter((area) =>
    area.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  const totalPaginas = Math.ceil(areasFiltradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const areasPaginadas = areasFiltradas.slice(indiceInicio, indiceFin);

  const handleEliminar = async (id) => {
    const area = areas.find((item) => (item.id_area || item.id) === id);
    if (!window.confirm(`¿Estás seguro de eliminar el área "${area?.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setEliminando(id);
    try {
      await api.areas.delete(id);
      setData(areas?.filter((item) => (item.id_area || item.id) !== id) || null);
      success('Área eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'Error al eliminar el área');
    } finally {
      setEliminando(null);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const ubicacionesNormalizadas = ubicaciones
      .map((ubicacion) => ({
        ...ubicacion,
        pasillo: ubicacion.pasillo?.trim() || '',
        estante: ubicacion.estante?.trim() || '',
        nivel: ubicacion.nivel?.trim() || ''
      }))
      .filter((ubicacion) => ubicacion.pasillo || ubicacion.estante || ubicacion.nivel);

    const hayUbicacionIncompleta = ubicacionesNormalizadas.some((ubicacion) => !ubicacion.pasillo || !ubicacion.estante || !ubicacion.nivel);
    if (hayUbicacionIncompleta) {
      showError('Cada ubicación debe incluir pasillo, estante y nivel');
      setGuardando(false);
      return;
    }

    const payload = {
      nombre: formState.nombre.trim(),
      ubicaciones: ubicacionesNormalizadas
    };

    if (!payload.nombre) {
      showError('El nombre del área es requerido');
      setGuardando(false);
      return;
    }

    try {
      if (areaEditar) {
        const areaId = areaEditar.id_area || areaEditar.id;
        await api.areas.update(areaId, payload);
        success('Área actualizada exitosamente');
      } else {
        await api.areas.create(payload);
        success('Área creada exitosamente');
      }

      await cargarAreas();
      cerrarModal();
    } catch (err) {
      showError(err.message || 'Error al guardar el área');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEditar = async (area) => {
    try {
      const fullData = await api.areas.getById(area.id_area || area.id);
      setAreaEditar(fullData);
      setMostrarModal(true);
    } catch (err) {
      setAreaEditar(area);
      setMostrarModal(true);
    }
  };

  const abrirModalNuevo = () => {
    setAreaEditar(null);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAreaEditar(null);
    setFormState({ nombre: '' });
    setUbicaciones([{ ...emptyUbicacion }]);
  };

  const handleUbicacionChange = (index, field, value) => {
    setUbicaciones((prev) => prev.map((ubicacion, currentIndex) => currentIndex === index ? { ...ubicacion, [field]: value } : ubicacion));
  };

  const agregarUbicacion = () => {
    setUbicaciones((prev) => [...prev, { ...emptyUbicacion }]);
  };

  const eliminarUbicacion = (index) => {
    setUbicaciones((prev) => prev.length === 1 ? [{ ...emptyUbicacion }] : prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const abrirModalQr = async (area) => {
    try {
      const fullData = await api.areas.getById(area.id_area || area.id);
      setModalQrArea(fullData);
    } catch {
      setModalQrArea(area);
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const imprimirQrs = () => {
    const contenido = printRef.current?.innerHTML;
    if (!contenido) return;
    const ventana = window.open('', '_blank', 'width=800,height=600');
    ventana.document.write(`
      <html><head><title>Códigos QR - ${modalQrArea?.nombre}</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .card { border: 2px dashed #94a3b8; border-radius: 12px; padding: 16px; text-align: center; page-break-inside: avoid; }
        .area-name { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .codigo { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 8px; font-family: monospace; word-break: break-all; }
        .detalle { font-size: 11px; color: #475569; margin-top: 4px; }
        svg { display: block; margin: 0 auto; }
        @media print { .grid { grid-template-columns: repeat(3, 1fr); } }
      </style></head>
      <body>${contenido}</body></html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => { ventana.print(); }, 300);
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[600px]">
        <LoadingSpinner size="lg" text="Cargando áreas..." />
      </div>;
  }

  if (error) {
    return <div className="p-6">
        <ErrorState message="Error al cargar las áreas" onRetry={cargarAreas} />
      </div>;
  }

  return <div className="p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Áreas</h1>
        <p className="text-gray-600">Administra las áreas y sus ubicaciones en el almacén</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar áreas..." value={busqueda} onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Agregar Área
          </button>
        </div>
      </div>

      {areasFiltradas.length === 0 ? <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <EmptyState icon={MapPin} message={busqueda ? 'No se encontraron áreas' : 'No hay áreas registradas'} description={busqueda ? 'Intenta con otro término de búsqueda' : 'Comienza agregando una nueva área'} />
        </div> : <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Área</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicaciones</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {areasPaginadas.map((area) => {
                  const areaId = area.id_area || area.id;
                  return <tr key={areaId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">#{areaId}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{area.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {area.codigo_area ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-md">
                                <QrCode className="w-3 h-3" />
                                {area.codigo_area}
                              </span>
                              <button
                                onClick={() => copiarCodigo(area.codigo_area)}
                                className="p-1 text-gray-400 hover:text-violet-600 transition-colors"
                                title="Copiar código"
                              >
                                {copiado === area.codigo_area ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin código</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
                              <Layers3 className="w-3 h-3" />
                              {area.total_ubicaciones || area.ubicaciones?.length || 0} ubicación(es)
                            </span>
                            {area.ubicaciones?.[0] && <p className="text-xs text-gray-500">
                                {area.ubicaciones[0].pasillo} / {area.ubicaciones[0].estante} / {area.ubicaciones[0].nivel}
                              </p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {area.fecha_creacion ? new Date(area.fecha_creacion).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => abrirModalQr(area)} className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Ver códigos QR de ubicaciones">
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button onClick={() => abrirModalEditar(area)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEliminar(areaId)} disabled={eliminando === areaId} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Eliminar">
                              {eliminando === areaId ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPaginas > 1 && <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, areasFiltradas.length)} de {areasFiltradas.length} áreas
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPaginaActual((p) => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => <button key={num} onClick={() => setPaginaActual(num)} className={`px-4 py-2 rounded-lg transition-colors ${paginaActual === num ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                      {num}
                    </button>)}
                </div>
                <button onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Siguiente
                </button>
              </div>
            </div>}
        </>}

      {/* Modal de Códigos QR */}
      {modalQrArea && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-violet-600" />
                  Códigos QR — {modalQrArea.nombre}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Imprime estos QR y pégalos en los racks físicos. Al escanearlos desde la app, el sistema identifica la ubicación automáticamente.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={imprimirQrs}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir todos
                </button>
                <button onClick={() => setModalQrArea(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* QR Grid */}
            <div className="overflow-y-auto p-6">
              {/* Area-level QR */}
              {modalQrArea.codigo_area && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    QR del Área (para escaneo rápido desde el móvil)
                  </h3>
                  <div className="border-2 border-violet-300 bg-violet-50/50 rounded-xl p-6 text-center max-w-xs mx-auto">
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">ÁREA</p>
                    <QRCodeSVG
                      value={modalQrArea.codigo_area}
                      size={180}
                      level="M"
                      style={{ margin: '0 auto' }}
                    />
                    <p className="font-mono text-base font-bold text-gray-900 mt-4 break-all">{modalQrArea.codigo_area}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{modalQrArea.nombre}</p>
                    <button
                      onClick={() => copiarCodigo(modalQrArea.codigo_area)}
                      className="mt-3 flex items-center gap-1.5 mx-auto text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    >
                      {copiado === modalQrArea.codigo_area ? (
                        <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copiado</span></>
                      ) : (
                        <><Copy className="w-3 h-3" />Copiar código</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Location-level QRs */}
              {(!modalQrArea.ubicaciones || modalQrArea.ubicaciones.length === 0) ? (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Esta área no tiene ubicaciones registradas.</p>
                  <p className="text-sm mt-1">Edita el área y agrega ubicaciones (Pasillo / Estante / Nivel) para generar sus QR.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers3 className="w-4 h-4" />
                    QR por Ubicación (Rack / Estante / Nivel)
                  </h3>
                  <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Include area QR in print grid */}
                    {modalQrArea.codigo_area && (
                      <div className="border-2 border-violet-300 bg-violet-50/30 rounded-xl p-5 text-center">
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">ÁREA</p>
                        <QRCodeSVG
                          value={modalQrArea.codigo_area}
                          size={140}
                          level="M"
                          style={{ margin: '0 auto' }}
                        />
                        <p className="font-mono text-sm font-bold text-gray-900 mt-3 break-all">{modalQrArea.codigo_area}</p>
                        <p className="text-xs text-gray-500 mt-1">{modalQrArea.nombre}</p>
                      </div>
                    )}
                    {modalQrArea.ubicaciones.map((ubicacion) => (
                      <div key={ubicacion.id_ubicacion} className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-violet-400 transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{modalQrArea.nombre}</p>
                        <QRCodeSVG
                          value={ubicacion.codigo_ubicacion}
                          size={140}
                          level="M"
                          style={{ margin: '0 auto' }}
                        />
                        <p className="font-mono text-sm font-bold text-gray-900 mt-3 break-all">{ubicacion.codigo_ubicacion}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pasillo {ubicacion.pasillo} · Estante {ubicacion.estante} · Nivel {ubicacion.nivel}
                        </p>
                        <button
                          onClick={() => copiarCodigo(ubicacion.codigo_ubicacion)}
                          className="mt-3 flex items-center gap-1.5 mx-auto text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                        >
                          {copiado === ubicacion.codigo_ubicacion ? (
                            <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copiado</span></>
                          ) : (
                            <><Copy className="w-3 h-3" />Copiar código</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 pb-5 pt-2 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 text-center">
                💡 El <strong>QR del Área</strong> (<span className="font-mono">codigo_area</span>) permite al empleado escanear el área desde la app móvil para la validación dinámica. Los <strong>QR de ubicación</strong> (<span className="font-mono">codigo_ubicacion</span>) identifican cada rack/estante específico.
              </p>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{areaEditar ? 'Editar Área' : 'Nueva Área'}</h2>
                {areaEditar?.fecha_creacion && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    Creado el {new Date(areaEditar.fecha_creacion).toLocaleString()}
                  </p>}
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGuardar}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">Nombre del Área *</label>
                  <input type="text" id="nombre" name="nombre" value={formState.nombre} onChange={(e) => setFormState({ nombre: e.target.value })} required placeholder="Ej: Papelería, Bodega..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       Ubicaciones asociadas
                     </h3>
                     <button type="button" onClick={agregarUbicacion} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                       Agregar ubicación
                     </button>
                   </div>
 
                   <div className="space-y-3">
                     {ubicaciones.map((ubicacion, index) => <div key={`${ubicacion.id_ubicacion || 'new'}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ubicación {index + 1}</span>
                           <button type="button" onClick={() => eliminarUbicacion(index)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                             Eliminar
                           </button>
                         </div>
 
                         <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Pasillo</label>
                           <input type="text" value={ubicacion.pasillo} onChange={(e) => handleUbicacionChange(index, 'pasillo', e.target.value)} placeholder="Ej: A, B, 1..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                         </div>
 
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Estante</label>
                             <input type="text" value={ubicacion.estante} onChange={(e) => handleUbicacionChange(index, 'estante', e.target.value)} placeholder="Ej: 1, 2..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Nivel / Altura</label>
                             <input type="text" value={ubicacion.nivel} onChange={(e) => handleUbicacionChange(index, 'nivel', e.target.value)} placeholder="Ej: 1, PB..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                           </div>
                         </div>
 
                         {ubicacion.id_ubicacion && <p className="text-[11px] text-gray-400">ID de ubicación: #{ubicacion.id_ubicacion}</p>}
                       </div>)}
                   </div>
 
                   <p className="text-xs text-gray-500 mt-3">
                     Puedes registrar varias ubicaciones para la misma área desde este mismo flujo.
                   </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button type="button" onClick={cerrarModal} disabled={guardando} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
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
