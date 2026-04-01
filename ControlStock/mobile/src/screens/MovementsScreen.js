import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function MovementsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestión de Operaciones</Text>
          <Text style={styles.headerSubtitle}>Registra los movimientos del inventario</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Selecciona el tipo de operación que deseas realizar. Las entradas aumentarán el stock disponible, mientras que las salidas lo disminuirán.
          </Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('EntryScreen')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Feather name="arrow-down-circle" size={40} color="#16a34a" />
            </View>
            <Text style={styles.actionText}>Registrar Entrada</Text>
            <Text style={styles.actionDesc}>Añadir stock a un producto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ExitScreen')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
              <Feather name="arrow-up-circle" size={40} color="#dc2626" />
            </View>
            <Text style={styles.actionText}>Registrar Salida</Text>
            <Text style={styles.actionDesc}>Retirar stock de un producto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: paddingTop,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#dbeafe',
    marginTop: 2
  },
  content: {
    padding: 16
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  infoText: {
    color: '#1e3a8a',
    fontSize: 13,
    lineHeight: 20
  },
  grid: {
    gap: 16
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  actionDesc: {
    color: '#64748b',
    fontSize: 13
  }
});
