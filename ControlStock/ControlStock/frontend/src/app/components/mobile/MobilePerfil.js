import { useState } from 'react';
import { ArrowLeft, User, Mail, Shield, Lock, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast';
export function MobilePerfil() {
  const navigate = useNavigate();
  const {
    user,
    logout,
    updatePassword
  } = useAuth();
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const {
    toasts,
    removeToast,
    success,
    error: showError
  } = useToast();
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmar: ''
  });
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      navigate('/');
    }
  };
  const handleCambiarPassword = async e => {
    e.preventDefault();
    if (passwords.nueva !== passwords.confirmar) {
      showError('Las contraseñas no coinciden');
      return;
    }
    if (passwords.nueva.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setGuardando(true);
    try {
      const result = await updatePassword(passwords.actual, passwords.nueva);
      if (result) {
        success('Contraseña actualizada exitosamente');
        setPasswords({
          actual: '',
          nueva: '',
          confirmar: ''
        });
        setMostrarCambioPassword(false);
      } else {
        showError('Error al actualizar la contraseña');
      }
    } catch (err) {
      showError('Error al actualizar la contraseña');
    } finally {
      setGuardando(false);
    }
  };
  const getRolLabel = rol => {
    switch (rol) {
      case 'administrador':
        return 'Administrador';
      case 'encargado':
        return 'Encargado de Sucursal';
      case 'empleado':
        return 'Empleado';
      default:
        return rol;
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mobile/dashboard')} className="p-2 hover:bg-blue-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Mi Perfil</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.nombre}</h2>
          <p className="text-sm text-gray-500">@{user?.usuario}</p>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Correo Electrónico</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Rol</p>
              <p className="text-sm font-medium text-gray-900">{user && getRolLabel(user.rol)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {user?.rol === 'empleado' && (
            <button onClick={() => alert("Función para modificar nombre y foto próximamente habilitada de forma completa, ¡Requiere backend de subida de imágenes!")} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-900">Editar Perfil (Nombre / Foto)</span>
            </button>
          )}

          <button onClick={() => setMostrarCambioPassword(!mostrarCambioPassword)} className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="flex-1 text-left font-medium text-gray-900">Cambiar Contraseña</span>
          </button>

          <button onClick={handleLogout} className="w-full bg-red-600 p-4 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors text-white">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>

        {/* Cambio de contraseña */}
        {mostrarCambioPassword && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-t-3xl w-full max-w-[390px] p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
                <button onClick={() => setMostrarCambioPassword(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCambiarPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input type="password" value={passwords.actual} onChange={e => setPasswords({
                ...passwords,
                actual: e.target.value
              })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="••••••••" required disabled={guardando} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input type="password" value={passwords.nueva} onChange={e => setPasswords({
                ...passwords,
                nueva: e.target.value
              })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="••••••••" required disabled={guardando} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input type="password" value={passwords.confirmar} onChange={e => setPasswords({
                ...passwords,
                confirmar: e.target.value
              })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="••••••••" required disabled={guardando} />
                </div>

                <button type="submit" disabled={guardando} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
                  {guardando ? <>
                      <LoadingSpinner size="sm" />
                      Actualizando...
                    </> : <>
                      <CheckCircle className="w-5 h-5" />
                      Actualizar Contraseña
                    </>}
                </button>
              </form>
            </div>
          </div>}

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">ControlStock Papelería v2.0</p>
          <p className="text-xs text-gray-400 mt-1">App Móvil para Empleados</p>
        </div>
      </div>
    </div>;
}