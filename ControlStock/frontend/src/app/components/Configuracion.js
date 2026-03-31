import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, CheckCircle, ArrowLeft, Camera, Image, Upload, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Configuracion() {
  const navigate = useNavigate();
  const { user, updatePassword, updateUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fotoPerfil, setFotoPerfil] = useState(user?.foto_perfil || null);
  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [restaurandoLogo, setRestaurandoLogo] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);

    try {
      let photoUrl = fotoPerfil;

      if (fotoPerfilFile) {
        const photoResponse = await api.usuarios.uploadPhoto(user.id, fotoPerfilFile);
        photoUrl = photoResponse.foto_perfil;
      }

      const updatedUser = await api.usuarios.update(user.id, {
        nombre,
        email,
        foto_perfil: photoUrl
      });

      updateUser({ ...user, ...updatedUser });
      setFotoPerfil(photoUrl);
      setFotoPerfilFile(null);
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado con exito' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message || 'Error al actualizar perfil' });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    if (contrasenaNueva !== confirmarContrasena) {
      setMensaje({ tipo: 'error', texto: 'Las contrasenas no coinciden' });
      return;
    }
    if (contrasenaNueva.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contrasena debe tener al menos 6 caracteres' });
      return;
    }

    const success = await updatePassword(contrasenaActual, contrasenaNueva);
    if (success) {
      setMensaje({ tipo: 'success', texto: 'Contrasena actualizada correctamente' });
      setContrasenaActual('');
      setContrasenaNueva('');
      setConfirmarContrasena('');
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar la contrasena' });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoPerfilFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPerfil(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await api.configuraciones.updateLogo(file);
      setMensaje({ tipo: 'success', texto: 'Logo del sistema actualizado correctamente' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al actualizar el logo' });
    } finally {
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleResetLogo = async () => {
    setRestaurandoLogo(true);
    try {
      await api.configuraciones.resetLogo();
      setMensaje({ tipo: 'success', texto: 'Logo restaurado al original del sistema' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al restaurar el logo' });
    } finally {
      setRestaurandoLogo(false);
    }
  };

  return <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors" title="Regresar al Dashboard">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuracion de Cuenta</h1>
          <p className="text-gray-500 mt-1">Administra tu perfil, contrasena y preferencias</p>
        </div>
      </div>

      {mensaje && <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {mensaje.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          <span className="text-sm font-medium">{mensaje.texto}</span>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {fotoPerfil ? <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-blue-600" />}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 shadow-md transition-colors" title="Cambiar Foto">
                  <Camera className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre Completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={guardandoPerfil} className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {guardandoPerfil ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            </form>
          </div>

          {user?.rol === 'administrador' && <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-md font-bold text-gray-900">Logo del Sistema</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">Personaliza el logo principal que ven todos los usuarios.</p>
              <div className="space-y-3">
                <button onClick={() => logoInputRef.current?.click()} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition items-center justify-center flex gap-2">
                  <Upload className="w-4 h-4" />
                  Subir Logo de Empresa
                </button>
                <button onClick={handleResetLogo} disabled={restaurandoLogo} className="w-full bg-white border border-purple-200 text-purple-700 font-medium py-2 rounded-lg transition items-center justify-center flex gap-2 hover:bg-purple-50 disabled:opacity-50">
                  <RotateCcw className="w-4 h-4" />
                  {restaurandoLogo ? 'Restaurando...' : 'Restaurar Logo Original'}
                </button>
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cambiar Contrasena</h2>
              <p className="text-sm text-gray-500">Actualiza tu contrasena sin salir del dashboard</p>
            </div>
          </div>

          <form onSubmit={handleCambiarContrasena} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contrasena Actual</label>
              <input type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contrasena</label>
              <input type="password" value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
              <p className="text-xs text-gray-500 mt-1">Minimo 6 caracteres</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contrasena</label>
              <input type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Actualizar Contrasena
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Recomendaciones:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>- Usa una combinacion de letras, numeros y simbolos</li>
              <li>- Cambia tu contrasena regularmente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>;
}
