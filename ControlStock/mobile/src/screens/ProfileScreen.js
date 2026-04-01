import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, StatusBar, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
const STORAGE_URL = API_BASE_URL.replace('/api', '/storage');

export function ProfileScreen() {
  const { user, token, setUser, signOut } = useAuth();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getAvatarUri = () => {
    if (user?.foto_perfil) {
      // El backend ya devuelve la URL completa vía accessor en Laravel
      if (user.foto_perfil.startsWith('http')) {
        return `${user.foto_perfil}${user.foto_perfil.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
      }
      return `${STORAGE_URL}/${user.foto_perfil}?t=${new Date().getTime()}`;
    }
    return null;
  };

  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('foto_perfil', { uri, name: filename, type });

      const response = await inventoryService.updateProfilePhoto(
        user.id_usuario || user.id,
        formData,
        token
      );

      // Actualizar el estado global del usuario con la nueva foto
      setUser({ ...user, foto_perfil: response.foto_perfil });
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      const response = await inventoryService.updateProfile(
        user.id_usuario || user.id,
        { nombre: nombre.trim() },
        token
      );

      // El backend retorna el objeto de usuario completo actualizado
      setUser(response);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el nombre.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setNombre(user?.nombre || '');
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setIsEditing(true)}>
              <Feather name="edit-2" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editHeaderBtn} onPress={cancelEdit}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            activeOpacity={isEditing ? 0.7 : 1} 
            onPress={pickImage}
            style={styles.avatarWrapper}
          >
            <View style={styles.avatar}>
              {uploading ? (
                <ActivityIndicator color="#2563eb" size="large" />
              ) : getAvatarUri() ? (
                <Image key={user?.foto_perfil} source={{ uri: getAvatarUri() }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {(user?.nombre?.[0] || user?.nombre_usuario?.[0] || '?').toUpperCase()}
                </Text>
              )}
            </View>
            {isEditing && (
              <View style={styles.cameraIconBadge}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre completo"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoFocus
            />
          ) : (
            <Text style={styles.name}>{user?.nombre || user?.nombre_usuario}</Text>
          )}

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.rol || 'Empleado'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Feather name="user" size={18} color="#2563eb" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Usuario</Text>
                <Text style={styles.infoValue}>{user?.nombre_usuario}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Feather name="shield" size={18} color="#16a34a" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Nivel de Acceso</Text>
                <Text style={styles.infoValue}>{user?.rol}</Text>
              </View>
            </View>
            {(user?.email || user?.telefono) && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                    <Feather name="mail" size={18} color="#db2777" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Contacto</Text>
                    <Text style={styles.infoValue}>{user?.email || user?.telefono}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes y Acciones</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={signOut}>
              <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                <Feather name="log-out" size={18} color="#dc2626" />
              </View>
              <Text style={styles.actionTextLogout}>Cerrar Sesión</Text>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>ControlStock v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: paddingTop,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 5,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerTop: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editHeaderBtn: {
    position: 'absolute',
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 10
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 8
  },
  avatarWrapper: {
    position: 'relative'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#60a5fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2563eb',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff'
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#2563eb'
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: '60%'
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  content: {
    padding: 24,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
    elevation: 3,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  infoTextContainer: {
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 68,
    marginRight: 12
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionTextLogout: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626'
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 32
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  }
});
