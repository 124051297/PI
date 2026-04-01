import { useEffect, useState, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function ProductsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarProductos = () => {
    setLoading(true);
    inventoryService.productos(token)
      .then(setProductos)
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProductos();
  }, [token]);

  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productos;
    const lowerB = busqueda.toLowerCase();
    return productos.filter(p => {
      const nombre = (p.nombre_producto || p.nombre || '').toLowerCase();
      const codigo = (p.id_producto || p.codigo || '').toString().toLowerCase();
      const area = (p.area || '').toLowerCase();
      const ubicacion = (p.ubicacion || '').toLowerCase();
      return nombre.includes(lowerB) || codigo.includes(lowerB) || area.includes(lowerB) || ubicacion.includes(lowerB);
    });
  }, [productos, busqueda]);

  return (
    <View style={styles.container}>
      {/* Header idéntico al de frontend */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Feather name="package" size={20} color="#ffffff" />
            <Text style={styles.headerTitle}>Productos</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="filter" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#93c5fd" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, código, área..."
            placeholderTextColor="#93c5fd"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')} style={styles.clearIcon}>
              <Feather name="x" size={16} color="#93c5fd" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.resultCount}>
          {productosFiltrados.length} de {productos.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => String(item.id_producto || item.id || Math.random())}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="package" size={48} color="#cbd5e1" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No se encontraron productos</Text>
              </View>
            }
            renderItem={({ item }) => {
              const nombre = item.nombre_producto || item.nombre;
              const codigo = item.id_producto || item.codigo;
              const precio = Number(item.precio_unitario || item.precio || 0);
              const stock = Number(item.stock || 0);
              const minStock = Number(item.stock_minimo || item.stockMinimo || 0);
              const area = item.area || 'Sin Área';
              const ubicacion = item.ubicacion || 'Sin Ubicación';

              const isLow = stock < minStock;
              const isWarn = stock < minStock * 1.5 && stock >= minStock;

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', flex: 1, gap: 12 }}>
                      <View style={[styles.iconBox, { backgroundColor: isLow ? '#fee2e2' : '#dbeafe' }]}>
                        <Feather name={isLow ? 'alert-triangle' : 'package'} size={20} color={isLow ? '#dc2626' : '#2563eb'} />
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.name} numberOfLines={2}>{nombre}</Text>
                        <Text style={styles.code}>#{codigo}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>${precio.toFixed(2)}</Text>
                  </View>

                  <View style={styles.stockGrid}>
                    <View style={[styles.stockBox, { backgroundColor: isLow ? '#fef2f2' : isWarn ? '#fff7ed' : '#f0fdf4', borderColor: isLow ? '#fecaca' : isWarn ? '#fed7aa' : '#bbf7d0' }]}>
                      <Text style={styles.stockLabel}>Stock Actual</Text>
                      <Text style={[styles.stockValue, { color: isLow ? '#b91c1c' : isWarn ? '#c2410c' : '#15803d' }]}>{stock}</Text>
                    </View>
                    <View style={[styles.stockBox, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
                      <Text style={styles.stockLabel}>Stock Mínimo</Text>
                      <Text style={[styles.stockValue, { color: '#0f172a' }]}>{minStock}</Text>
                    </View>
                  </View>

                  <View style={styles.badgesRow}>
                    <View style={styles.areaBadge}>
                      <Text style={styles.areaBadgeText}>{area}</Text>
                    </View>
                    <View style={styles.locBadge}>
                      <Feather name="map-pin" size={10} color="#047857" style={{ marginRight: 4 }} />
                      <Text style={styles.locBadgeText}>{ubicacion}</Text>
                    </View>
                    {isLow && (
                      <View style={styles.alertMini}>
                        <Feather name="alert-triangle" size={10} color="#dc2626" style={{ marginRight: 4 }} />
                        <Text style={styles.alertMiniText}>Stock bajo</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 48
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    height: '100%',
  },
  clearIcon: {
    padding: 4
  },
  resultCount: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
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
    marginBottom: 12
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
    borderColor: '#e2e8f0'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2
  },
  code: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace'
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  stockGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  stockBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  stockLabel: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 4
  },
  stockValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  areaBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  areaBadgeText: {
    fontSize: 10,
    color: '#4338ca',
    fontWeight: '600'
  },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  locBadgeText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '600'
  },
  alertMini: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  alertMiniText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600'
  }
});
