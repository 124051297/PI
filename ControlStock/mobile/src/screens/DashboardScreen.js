import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// SafeArea helper
const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function DashboardScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.dashboardStats(token)
      .then(setStats)
      .catch((e) => console.log('Error dashboard:', e))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <View style={styles.container}>
      {/* Header idéntico al de frontend */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Móvil</Text>
            <Text style={styles.headerSubtitle}>Gestión de Inventario - {user?.nombre || user?.nombre_usuario}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="menu" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {/* Estadísticas */}
            <View style={styles.row}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={styles.statHeader}>
                  <Feather name="arrow-down-circle" size={14} color="#16a34a" />
                  <Text style={styles.statTitleGreen}>ENTRADAS</Text>
                </View>
                <Text style={styles.statValue}>{stats?.entradasHoy || 0}</Text>
                <Text style={styles.statDesc}>registradas hoy</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={styles.statHeader}>
                  <Feather name="arrow-up-circle" size={14} color="#9333ea" />
                  <Text style={styles.statTitlePurple}>SALIDAS</Text>
                </View>
                <Text style={styles.statValue}>{stats?.salidasHoy || 0}</Text>
                <Text style={styles.statDesc}>registradas hoy</Text>
              </View>
            </View>

            {/* Acciones */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.actionCard, { flex: 1 }]}
                onPress={() => navigation.navigate('Operaciones')}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                  <Feather name="arrow-down-circle" size={24} color="#16a34a" />
                </View>
                <Text style={styles.actionText}>Entrada / Salida</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { flex: 1 }]}
                onPress={() => navigation.navigate('Productos')}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                  <Feather name="package" size={24} color="#2563eb" />
                </View>
                <Text style={styles.actionText}>Ver Productos</Text>
              </TouchableOpacity>
            </View>

            {/* Bajo Stock */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Productos con Bajo Stock</Text>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{stats?.bajoStock || 0} ALERTAS</Text>
                </View>
              </View>

              {stats?.productosBajoStock && stats.productosBajoStock.length > 0 ? (
                stats.productosBajoStock.map((prod, i) => (
                  <View key={i} style={styles.lowStockRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lowStockName} numberOfLines={1}>{prod.nombre}</Text>
                      <Text style={styles.lowStockArea}>{prod.area || 'Sin Área'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.lowStockValue}>{prod.stock_actual || prod.stock}</Text>
                      <Text style={styles.lowStockDesc}>unid. actuales</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyAlerts}>
                  <Feather name="package" size={32} color="#22c55e" style={{ opacity: 0.5, marginBottom: 8 }} />
                  <Text style={styles.emptyAlertsTitle}>SIN ALERTAS</Text>
                  <Text style={styles.emptyAlertsSubtitle}>Todo el stock está en niveles normales</Text>
                </View>
              )}
            </View>

            {/* Actividad */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Actividad del Sistema</Text>
              {stats?.actividadReciente && stats.actividadReciente.length > 0 ? (
                stats.actividadReciente.slice(0, 5).map((act, i) => {
                  const isCreate = act.accion === 'Crear';
                  const isDelete = act.accion === 'Eliminar';
                  return (
                    <View key={i} style={styles.activityRow}>
                      <View style={[styles.activityIcon, { backgroundColor: isCreate ? '#dcfce7' : isDelete ? '#fee2e2' : '#dbeafe' }]}>
                        <Feather 
                          name={isCreate ? 'arrow-down-circle' : isDelete ? 'arrow-up-circle' : 'package'} 
                          size={16} 
                          color={isCreate ? '#16a34a' : isDelete ? '#dc2626' : '#2563eb'} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle} numberOfLines={1}>{act.entidad} - {act.accion}</Text>
                        <Text style={styles.activityDesc} numberOfLines={1}>{act.detalles}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noActivity}>No hay actividad reciente.</Text>
              )}
            </View>

            {/* Online status */}
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>EN LÍNEA</Text>
            </View>
          </>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  menuButton: {
    backgroundColor: '#1d4ed8',
    padding: 8,
    borderRadius: 8
  },
  scrollContent: {
    padding: 16
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statTitleGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  statTitlePurple: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9333ea',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  statDesc: {
    fontSize: 10,
    color: '#64748b',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 14,
  },
  alertBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertBadgeText: {
    color: '#c2410c',
    fontSize: 10,
    fontWeight: '700',
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  lowStockArea: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  lowStockValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#dc2626',
  },
  lowStockDesc: {
    fontSize: 10,
    color: '#64748b',
  },
  emptyAlerts: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyAlertsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  emptyAlertsSubtitle: {
    fontSize: 10,
    color: '#15803d',
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  activityDesc: {
    fontSize: 10,
    color: '#64748b',
  },
  noActivity: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  onlineBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 40,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
  }
});
