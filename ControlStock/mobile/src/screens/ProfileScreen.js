import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenLayout title="Perfil" subtitle="Informacion del empleado autenticado">
      <View style={styles.card}>
        <Text style={styles.name}>{user?.nombre || user?.nombre_usuario}</Text>
        <Text style={styles.meta}>Usuario: {user?.nombre_usuario}</Text>
        <Text style={styles.meta}>Rol: {user?.rol}</Text>
        <Pressable style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Cerrar sesion</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 10
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  meta: {
    color: '#475569'
  },
  button: {
    marginTop: 12,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  }
});
