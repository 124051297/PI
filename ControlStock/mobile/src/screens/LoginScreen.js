import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const result = await signIn(username, password);
    if (!result.success) {
      setError(result.error || 'No fue posible iniciar sesion');
    }
  };

  return (
    <ScreenLayout title="ControlStock" subtitle="Acceso movil para empleados">
      <View style={styles.card}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput value={username} onChangeText={setUsername} placeholder="Nombre de usuario" style={styles.input} />
        <Text style={styles.label}>Contrasena</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="Contrasena" secureTextEntry style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 12
  },
  label: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  error: {
    color: '#dc2626'
  }
});
