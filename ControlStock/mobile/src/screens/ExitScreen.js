import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
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
  const [ubicaciones, setUbicaciones] = useState([]);
  
  const [productoSel, setProductoSel] = useState(null);
  const [areaSel, setAreaSel] = useState(null);
  const [ubicacionSel, setUbicacionSel] = useState(null);
  const [cantidad, setCantidad] = useState('');
  
  const [modalProdVisible, setModalProdVisible] = useState(false);
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [modalUbicVisible, setModalUbicVisible] = useState(false);
  
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    inventoryService.productos(token).then(setProductos).catch(()=>[]);
    inventoryService.areas(token).then(setAreas).catch(()=>[]);
    inventoryService.ubicaciones(token).then(setUbicaciones).catch(()=>[]);
  }, [token]);

  const ubicacionesFiltradas = useMemo(() => {
    if (!areaSel) return [];
    return ubicaciones.filter(u => String(u.id_area) === String(areaSel.id_area || areaSel.id));
  }, [areaSel, ubicaciones]);

  const validarUbicacionFisica = async (codigo_ubicacion) => {
    setGuardando(true);
    try {
      // Intentar encontrar la ubicación localmente primero para identificar el área rápido
      const localUbi = ubicaciones.find(u => String(u.codigo_ubicacion) === String(codigo_ubicacion));
      if (localUbi) {
        setUbicacionSel(localUbi);
        const areaFound = areas.find(a => a.id_area === localUbi.id_area);
        if (areaFound) setAreaSel(areaFound);
      }

      if (!productoSel) {
        Alert.alert('Ubicación Detectada', 'Ahora selecciona el producto para validar el stock disponible en esta ubicación.');
        setGuardando(false);
        return;
      }

      const res = await inventoryService.validarStockUbicacion({
        id_producto: productoSel.id_producto || productoSel.id,
        codigo_ubicacion: codigo_ubicacion
      }, token);

      if (res.valido) {
        setUbicacionSel({ ...localUbi, stock_validado: res.stock_actual });
        Alert.alert('Validación Exitosa', `Stock disponible en esta ubicación: ${res.stock_actual}`);
      } else {
        let extraInfo = '';
        if (res.sugerencias && res.sugerencias.length > 0) {
          extraInfo = '\n\nPuedes encontrar este producto en:\n' + 
            res.sugerencias.map(s => `- ${s.area} (Rack: ${s.ubicacion}): ${s.stock} uds`).join('\n');
        }
        Alert.alert('Aviso de Stock', (res.mensaje || 'No hay stock en esta ubicación para el producto seleccionado.') + extraInfo);
      }
    } catch(e) {
      Alert.alert('Error', 'No se pudo realizar la validación con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async () => {
    if (!productoSel || !cantidad || !areaSel) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (Producto, Cantidad y Área).');
      return;
    }

    // Permitir bypass si el area no tiene ubicaciones dinamicas
    if (!ubicacionSel && ubicacionesFiltradas.length > 0) {
      Alert.alert('Validación Requerida', 'Esta área tiene ubicaciones dinámicas. Debes validar escaneando el rack o seleccionando una ubicación para continuar.');
      return;
    }

    const qty = parseInt(cantidad, 10);
    if (qty > (productoSel.stock || 0)) {
      Alert.alert('Error', `Stock insuficiente en almacén general. Disponible: ${productoSel.stock}`);
      return;
    }

    if (ubicacionSel) {
      // Verificar stock en el NODO especifico
      const nodo = productoSel.ubicaciones_detalle?.find(ud => ud.id_ubicacion === ubicacionSel.id_ubicacion);
      // Si el usuario escaneó recién, maybe guardamos el stock en ubicacionSel.stock_validado
      const stockEnRack = ubicacionSel.stock_validado !== undefined 
                            ? ubicacionSel.stock_validado 
                            : (nodo ? nodo.stock_en_ubicacion : 0);

      if (qty > stockEnRack) {
        Alert.alert(
          'Stock Insuficiente en Ubicación', 
          `No puedes retirar ${qty} uds de este Rack.\n\nFísicamente solo tienes registrado: ${stockEnRack} uds en esta ubicación exacta.`
        );
        return;
      }
    }

    setGuardando(true);
    try {
      await inventoryService.crearSalida({
        id_empleado: user?.id_empleado,
        id_area: areaSel.id_area || areaSel.id,
        items: [
          {
            id_producto: productoSel.id_producto || productoSel.id,
            cantidad: qty,
            id_ubicacion: ubicacionSel?.id_ubicacion || ubicacionSel?.id
          }
        ]
      }, token);

      setExito(true);
      setProductoSel(null);
      setAreaSel(null);
      setUbicacionSel(null);
      setCantidad('');
      
      setTimeout(() => {
        setExito(false);
      }, 3000);
    } catch (e) {
      Alert.alert('Error al Registrar', e.message || 'No se pudo registrar la salida. Verifica el stock en la ubicación seleccionada.');
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    if (areaSel) {
                      const idA = areaSel.id_area || areaSel.id;
                      const hasStockInArea = found.ubicaciones_detalle?.some(ud => String(ud.id_area) === String(idA));
                      if (!hasStockInArea) {
                        let msg = `El producto "${found.nombre || found.nombre_producto}" no tiene stock registrado en el área ${areaSel.nombre}.`;
                        if (found.ubicaciones_detalle?.length > 0) {
                          msg += '\n\nPuedes encontrarlo en:\n' + 
                                found.ubicaciones_detalle.map(ud => `- ${ud.area}: ${ud.stock_en_ubicacion} uds`).join('\n');
                        }
                        Alert.alert('Consignación de Ubicación', msg);
                      }
                    }
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

        {/* Form Group for qty */}
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

        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Validación Dinámica de Ubicación (Requerido)</Text>
            <TouchableOpacity 
              style={styles.scanMiniBtn} 
              onPress={() => navigation.navigate('BarcodeScannerScreen', { 
                onScan: (code) => validarUbicacionFisica(code) 
              })}
            >
              <Feather name="maximize" size={16} color="#2563eb" />
              <Text style={styles.scanMiniText}>Validar Rack</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.selector, ubicacionSel ? { borderColor: '#16a34a', backgroundColor: '#f0fdf4' } : null]} 
            onPress={() => areaSel ? setModalUbicVisible(true) : Alert.alert('Área requerida', 'Selecciona primero un área para filtrar. O simplemente escanea un Rack para que el sistema busque el área automática (Override).')}
          >
            <Text style={[styles.selectorText, !ubicacionSel && styles.placeholder, ubicacionSel ? { color: '#16a34a', fontWeight: 'bold' } : null]}>
              {ubicacionSel ? `Confirmado: ${ubicacionSel.codigo_ubicacion} (P-${ubicacionSel.pasillo} E-${ubicacionSel.estante} N-${ubicacionSel.nivel})` : 'Escanear o seleccionar ubicación'}
            </Text>
            <Feather name={ubicacionSel ? "check-circle" : "chevron-down"} size={18} color={ubicacionSel ? "#16a34a" : "#94a3b8"} />
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
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Producto */}
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
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { 
                    setProductoSel(item); 
                    setModalProdVisible(false); 
                    if (areaSel) {
                      const idA = areaSel.id_area || areaSel.id;
                      const hasStockInArea = item.ubicaciones_detalle?.some(ud => String(ud.id_area) === String(idA));
                      if (!hasStockInArea) {
                        let msg = `El producto "${item.nombre || item.nombre_producto}" no tiene stock registrado en el área ${areaSel.nombre}.`;
                        if (item.ubicaciones_detalle?.length > 0) {
                          msg += '\n\nPuedes encontrarlo en:\n' + 
                                item.ubicaciones_detalle.map(ud => `- ${ud.area}: ${ud.stock_en_ubicacion} uds`).join('\n');
                        }
                        Alert.alert('Consignación de Ubicación', msg);
                      }
                    }
                  }}
                >
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
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { 
                    setAreaSel(item); 
                    setUbicacionSel(null); 
                    setModalAreaVisible(false); 
                    
                    if (productoSel) {
                      const idA = item.id_area || item.id;
                      const hasStockInArea = productoSel.ubicaciones_detalle?.some(ud => String(ud.id_area) === String(idA));
                      if (!hasStockInArea) {
                        let msg = `El producto "${productoSel.nombre}" no tiene stock registrado en el área ${item.nombre}.`;
                        if (productoSel.ubicaciones_detalle?.length > 0) {
                          msg += '\n\nPuedes encontrarlo en:\n' + 
                                productoSel.ubicaciones_detalle.map(ud => `- ${ud.area}: ${ud.stock_en_ubicacion} uds`).join('\n');
                        }
                        Alert.alert('Consignación de Ubicación', msg);
                      }
                    }
                  }}
                >
                  <Text style={styles.modalItemTitle}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Ubicacion Modal */}
      <Modal visible={modalUbicVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ubicación</Text>
              <TouchableOpacity onPress={() => setModalUbicVisible(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ubicacionesFiltradas}
              keyExtractor={(i) => String(i.id_ubicacion || i.id || Math.random())}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#64748b' }}>No hay ubicaciones registradas para esta área.</Text>
                </View>
              }
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setUbicacionSel(item); setModalUbicVisible(false); }}>
                  <Text style={styles.modalItemTitle}>{item.codigo_ubicacion}</Text>
                  <Text style={styles.modalItemSub}>Pasillo: {item.pasillo} | Estante: {item.estante} | Nivel: {item.nivel}</Text>
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
