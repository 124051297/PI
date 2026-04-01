import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onScan } = route.params || {};

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
        requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.container}><Text>Cargando permisos...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    
    // Devolver el dato a la pantalla anterior
    if (onScan) {
      onScan(data);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
               <Feather name="x" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Escaneando Código</Text>
          </View>
          
          <View style={styles.scannerBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <Text style={styles.hint}>Apunta al código de barras del producto</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: paddingTop },
  closeBtn: { padding: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  scannerBox: { width: 250, height: 250, borderWidth: 0, position: 'relative' },
  hint: { color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 40 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#fff', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  message: { color: '#fff', textAlign: 'center', marginBottom: 20, fontSize: 16 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
