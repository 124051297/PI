import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function NotificationsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [refreshing, setRefreshing] = useState(false);

  const cargarNotificaciones = async () => {
    setRefreshing(true);
    try {
      const data = await inventoryService.notificaciones(token);
      setNotificaciones(data || []);
    } catch (err) {
      console.error('Error al cargar notificaciones', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, [token]);

  const notificacionesFiltradas = notificaciones.filter((n) => filtro === 'todas' ? true : !n.leida);
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = async (id) => {
    try {
      await inventoryService.marcarNotificacion(id, { leida: true }, token);
      setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
    } catch (err) {
      Alert.alert('Error', 'No se pudo marcar como leída.');
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await inventoryService.marcarTodasNotificaciones(token);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      Alert.alert('Error', 'No se pudo marcar todas.');
    }
  };

  const eliminarNotificacion = (id) => {
    Alert.alert('Eliminar', '¿Estás seguro de eliminar esta notificación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await inventoryService.eliminarNotificacion(id, token);
            setNotificaciones((prev) => prev.filter((n) => n.id !== id));
          } catch (err) {
             Alert.alert('Error', 'No se pudo eliminar la notificación.');
          }
        }
      }
    ]);
  };

  const getIcono = (tipo) => {
    switch (tipo) {
      case 'success':
        return { name: 'check-circle', color: '#16a34a', bg: '#dcfce7' };
      case 'warning':
        return { name: 'alert-triangle', color: '#ea580c', bg: '#ffedd5' };
      case 'error':
        return { name: 'alert-triangle', color: '#dc2626', bg: '#fee2e2' };
      default:
        return { name: 'info', color: '#2563eb', bg: '#dbeafe' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Feather name="bell" size={20} color="#ffffff" />
            <Text style={styles.headerTitle}>Notificaciones</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notificaciones')} style={[styles.headerBtn, styles.headerBtnBadge]}>
            <Feather name="bell" size={18} color="#ffffff" />
            {noLeidas > 0 && (
              <View style={styles.alertCountBadge}>
                <Text style={styles.alertCountText}>{noLeidas}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
        </Text>

        {noLeidas > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={marcarTodasComoLeidas}>
            <Feather name="check" size={16} color="#2563eb" />
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setFiltro('todas')} style={[styles.tabButton, filtro === 'todas' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, filtro === 'todas' && styles.tabTextActive]}>Todas ({notificaciones.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFiltro('no-leidas')} style={[styles.tabButton, filtro === 'no-leidas' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, filtro === 'no-leidas' && styles.tabTextActive]}>Sin leer ({noLeidas})</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notificacionesFiltradas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={cargarNotificaciones}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="bell" size={48} color="#e2e8f0" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No hay notificaciones para mostrar</Text>
            </View>
          }
          renderItem={({ item }) => {
            const { name, color, bg } = getIcono(item.tipo);
            return (
              <View style={[styles.card, item.leida ? styles.cardRead : styles.cardUnread]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                    <Feather name={name} size={20} color={color} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, !item.leida && styles.titleUnread]} numberOfLines={1}>{item.titulo}</Text>
                      {!item.leida && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.timeText}>
                      <Feather name="clock" size={12} color="#94a3b8" /> {new Date(item.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                    <Text style={styles.message}>{item.mensaje}</Text>
                    
                    <View style={styles.actionsRow}>
                      {!item.leida && (
                        <TouchableOpacity onPress={() => marcarComoLeida(item.id)}>
                          <Text style={styles.actionTextBlue}>Marcar como leída</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarNotificacion(item.id)}>
                        <Feather name="trash-2" size={12} color="#dc2626" />
                        <Text style={styles.actionTextRed}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
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
    marginBottom: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1d4ed8'
  },
  headerTitleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerBtnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  alertCountBadge: {
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 1.5,
    borderColor: '#1d4ed8'
  },
  alertCountText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6
  },
  markAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500'
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b'
  },
  tabTextActive: {
    color: '#f8fafc'
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyIcon: {
    marginBottom: 16
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardUnread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  cardRead: {
    borderColor: '#e2e8f0',
    opacity: 0.85
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  title: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
    flexShrink: 1
  },
  titleUnread: {
    color: '#1e3a8a'
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563eb',
    borderRadius: 4
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8
  },
  message: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  actionTextBlue: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '500'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionTextRed: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500'
  }
});
