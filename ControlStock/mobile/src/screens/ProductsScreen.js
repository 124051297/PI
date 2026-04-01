import { useEffect, useState, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
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
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

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

  const categoriasDisponibles = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    return cats.sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let result = productos;
    
    if (categoriaFiltro !== 'Todas') {
      result = result.filter(p => p.categoria === categoriaFiltro);
    }
    
    if (!busqueda) return result;
    
    const lowerB = busqueda.toLowerCase();
    return result.filter(p => {
      const nombre = (p.nombre_producto || p.nombre || '').toLowerCase();
      const codigo = (p.id_producto || p.codigo || '').toString().toLowerCase();
      const area = (p.area || '').toLowerCase();
      const ubicacion = (p.ubicacion || '').toLowerCase();
      const categoria = (p.categoria || '').toLowerCase();
      return nombre.includes(lowerB) || 
             codigo.includes(lowerB) || 
             area.includes(lowerB) || 
             ubicacion.includes(lowerB) || 
             categoria.includes(lowerB);
    });
  }, [productos, busqueda, categoriaFiltro]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Feather name="package" size={20} color="#ffffff" />
            <Text style={styles.headerTitle}>Productos</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#93c5fd" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#93c5fd"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')} style={styles.clearIcon}>
              <Feather name="x" size={16} color="#93c5fd" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categorías:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {['Todas', ...categoriasDisponibles].map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.chip, categoriaFiltro === cat && styles.chipActive]}
                onPress={() => setCategoriaFiltro(cat)}
              >
                <Text style={[styles.chipText, categoriaFiltro === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.resultCount}>
          {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}
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
              const isLow = stock < minStock;

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <View style={[styles.iconBox, { backgroundColor: isLow ? '#fee2e2' : '#dbeafe' }]}>
                        <Feather name={isLow ? 'alert-triangle' : 'package'} size={20} color={isLow ? '#dc2626' : '#2563eb'} />
                      </View>
                      <View>
                        <Text style={styles.name} numberOfLines={1}>{nombre}</Text>
                        <Text style={styles.code}>#{codigo}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>${precio.toFixed(2)}</Text>
                  </View>

                  <View style={styles.stockRow}>
                    <View style={styles.stockItem}>
                      <Text style={styles.stockLabelText}>Stock</Text>
                      <Text style={[styles.stockValue, isLow && { color: '#dc2626' }]}>{stock}</Text>
                    </View>
                    <View style={styles.stockItem}>
                      <Text style={styles.stockLabelText}>Mínimo</Text>
                      <Text style={styles.stockValueNormal}>{minStock}</Text>
                    </View>
                    <View style={styles.badgeContainer}>
                      <View style={styles.areaBadge}>
                        <Text style={styles.areaBadgeText}>{item.area || 'Sin Área'}</Text>
                      </View>
                    </View>
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: paddingTop,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 8
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 44
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  clearIcon: { padding: 4 },
  content: { flex: 1, padding: 16 },
  filterSection: { marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase' },
  chipsScroll: { paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultCount: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  code: { fontSize: 12, color: '#94a3b8' },
  price: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stockItem: { alignItems: 'flex-start' },
  stockLabelText: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  stockValue: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  stockValueNormal: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  badgeContainer: { flex: 1, alignItems: 'flex-end' },
  areaBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  areaBadgeText: { fontSize: 10, color: '#2563eb', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyIcon: { marginBottom: 12 },
  emptyText: { color: '#94a3b8' }
});
