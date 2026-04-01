import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function ExitScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation();

  const [productos, setProductos] = useState([]);
  const [areas, setAreas] = useState([]);
  
  const [productoSel, setProductoSel] = useState(null);
  const [areaSel, setAreaSel] = useState(null);
  const [cantidad, setCantidad] = useState('');
  
  const [modalProdVisible, setModalProdVisible] = useState(false);
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    inventoryService.productos(token).then(setProductos).catch(()=>[]);
    inventoryService.areas(token).then(setAreas).catch(()=>[]);
  }, [token]);

  const handleSubmit = async () => {
    if (!productoSel || !cantidad || !areaSel) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const qty = parseInt(cantidad, 10);
    if (qty > productoSel.stock) {
      Alert.alert('Error', `Stock insuficiente. Disponible: ${productoSel.stock}`);
      return;
    }

    setGuardando(true);
    try {
      await inventoryService.crearSalida({
        id_empleado: user?.id_empleado,
        id_area: areaSel.id_area || areaSel.id,
        items: [
          {
            id_producto: productoSel.id_producto || productoSel.id,
            cantidad: qty
          }
        ]
      }, token);

      setExito(true);
      setProductoSel(null);
      setAreaSel(null);
      setCantidad('');
      
      setTimeout(() => {
        setExito(false);
      }, 3000);
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar la salida.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Feather name="arrow-up-circle" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>Registrar Salida</Text>
          </View>
        </View>
      </View>

      {/* Success Modal */}
      {exito && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Feather name="check-circle" size={48} color="#16a34a" />
            </View>
            <Text style={styles.successTitle}>¡Salida Registrada!</Text>
            <Text style={styles.successText}>La salida se ha guardado correctamente</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            <Text style={{fontWeight: 'bold'}}>Importante:</Text> Verifica el stock disponible antes de registrar la salida. No se puede retirar más de lo disponible.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              <Feather name="package" size={14} color="#2563eb" /> Producto
            </Text>
            <TouchableOpacity 
              style={styles.scanMiniBtn} 
              onPress={() => navigation.navigate('BarcodeScannerScreen', { 
                onScan: (code) => {
                  const found = productos.find(p => String(p.codigo || p.id_producto) === String(code));
                  if (found) {
                    setProductoSel(found);
                  } else {
                    Alert.alert('No encontrado', `No se encontró ningún producto con el código: ${code}`);
                  }
                } 
              })}
            >
              <Feather name="maximize" size={16} color="#2563eb" />
              <Text style={styles.scanMiniText}>Escanear</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.selector} onPress={() => setModalProdVisible(true)}>
            <Text style={[styles.selectorText, !productoSel && styles.placeholder]}>
              {productoSel ? `${productoSel.codigo || '#'} - ${productoSel.nombre || productoSel.nombre_producto} (Stock: ${productoSel.stock})` : 'Seleccionar producto'}
            </Text>
            <Feather name="chevron-down" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Stock Info Dynamic Box */}
        {productoSel && (
          <View style={[styles.stockInfo, productoSel.stock < (productoSel.stockMinimo||productoSel.stock_minimo) ? styles.stockInfoLow : null]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4}}>
              {productoSel.stock < (productoSel.stockMinimo||productoSel.stock_minimo) && <Feather name="alert-triangle" size={14} color="#dc2626" />}
              <Text style={styles.stockInfoTitle}>Stock Disponible</Text>
            </View>
            <Text style={styles.stockInfoValue}>{productoSel.stock} unidades</Text>
            <Text style={styles.stockInfoMin}>Stock mínimo: {productoSel.stockMinimo || productoSel.stock_minimo}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cantidad a Retirar</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="number-pad"
            value={cantidad}
            onChangeText={setCantidad}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Área de Procedencia</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setModalAreaVisible(true)}>
            <Text style={[styles.selectorText, !areaSel && styles.placeholder]}>
              {areaSel ? areaSel.nombre : 'Seleccionar área'}
            </Text>
            <Feather name="chevron-down" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={guardando}>
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="arrow-up-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Registrar Salida</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.employeeBox}>
          <Text style={styles.employeeLabel}>Registrado por</Text>
          <Text style={styles.employeeValue}>{user?.nombre || user?.nombre_usuario}</Text>
        </View>
      </View>

      {/* Producto Modal */}
      <Modal visible={modalProdVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              <TouchableOpacity onPress={() => setModalProdVisible(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={productos}
              keyExtractor={(i) => String(i.id || i.id_producto || Math.random())}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setProductoSel(item); setModalProdVisible(false); }}>
                  <Text style={styles.modalItemTitle}>{item.nombre || item.nombre_producto}</Text>
                  <Text style={styles.modalItemSub}>Stock: {item.stock} | Código: {item.codigo || item.id_producto}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Area Modal */}
      <Modal visible={modalAreaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Área</Text>
              <TouchableOpacity onPress={() => setModalAreaVisible(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={areas}
              keyExtractor={(i) => String(i.id || Math.random())}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setAreaSel(item); setModalAreaVisible(false); }}>
                  <Text style={styles.modalItemTitle}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#dc2626',
    paddingTop: paddingTop,
    elevation: 4,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerBtn: { padding: 8, borderRadius: 8, backgroundColor: '#b91c1c' },
  headerTitleBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: '80%' },
  successIconBox: { width: 80, height: 80, backgroundColor: '#dcfce7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  successText: { color: '#4b5563', textAlign: 'center' },
  content: { padding: 16 },
  noteBox: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', padding: 16, borderRadius: 12, marginBottom: 16 },
  noteText: { color: '#9a3412', fontSize: 13, lineHeight: 20 },
  formGroup: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#111827' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scanMiniBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: '#bfdbfe' },
  scanMiniText: { fontSize: 12, color: '#2563eb', fontWeight: 'bold' },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
  selectorText: { fontSize: 15, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, fontWeight: 'bold', color: '#111827' },
  stockInfo: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12 },
  stockInfoLow: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  stockInfoTitle: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  stockInfoValue: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  stockInfoMin: { fontSize: 10, color: '#64748b', marginTop: 2 },
  submitBtn: { backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  employeeBox: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginTop: 16 },
  employeeLabel: { fontSize: 11, color: '#4b5563', marginBottom: 4 },
  employeeValue: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  modalItemSub: { fontSize: 12, color: '#64748b', marginTop: 4 }
});
