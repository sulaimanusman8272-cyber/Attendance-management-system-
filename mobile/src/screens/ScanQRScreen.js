import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api/axios';

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultMsg, setResultMsg] = useState('');

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      await api.post('/attendance/mark', { qr_token: data });
      setResult('success');
      setResultMsg('Attendance marked successfully!');
    } catch (err) {
      setResult('error');
      setResultMsg(err.response?.data?.message || 'Failed to mark attendance.');
    } finally { setLoading(false); }
  };

  const reset = () => { setScanned(false); setResult(null); setResultMsg(''); };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#009688" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Permission Required</Text>
        <Text style={styles.permText}>We need camera access to scan QR codes for attendance.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    return (
      <View style={[styles.center, { backgroundColor: '#f0f4f4' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.resultCard, result === 'success' ? styles.successCard : styles.errorCard]}>
          <Text style={styles.resultIcon}>{result === 'success' ? '✅' : '❌'}</Text>
          <Text style={styles.resultTitle}>{result === 'success' ? 'Success!' : 'Failed'}</Text>
          <Text style={styles.resultMsg}>{resultMsg}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={reset}>
          <Text style={styles.btnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Top label */}
      <View style={styles.topOverlay}>
        <Text style={styles.scanTitle}>Scan QR Code</Text>
        <Text style={styles.scanSubtitle}>Point camera at the QR shown by your teacher</Text>
      </View>

      {/* Middle: dark sides + scan box */}
      <View style={styles.middleRow}>
        <View style={styles.darkSide} />
        <View style={styles.scanBox}>
          {/* Corners */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          {loading && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#009688" />
              <Text style={styles.scanningText}>Marking...</Text>
            </View>
          )}
        </View>
        <View style={styles.darkSide} />
      </View>

      {/* Bottom */}
      <View style={styles.bottomOverlay}>
        <View style={styles.scanHintBox}>
          <Text style={styles.scanHintText}>Align the QR code within the frame</Text>
        </View>
      </View>
    </View>
  );
}

const BOX = 260;
const DARK = 'rgba(0,0,0,0.65)';
const CORNER_SIZE = 28;
const BORDER = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f4', padding: 28 },
  permIcon: { fontSize: 60, marginBottom: 16 },
  permTitle: { fontSize: 20, fontWeight: '800', color: '#263238', marginBottom: 8 },
  permText: { fontSize: 14, color: '#78909c', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btn: {
    backgroundColor: '#009688', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
    shadowColor: '#009688', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  topOverlay: {
    backgroundColor: DARK,
    paddingTop: 60, paddingBottom: 24,
    alignItems: 'center', paddingHorizontal: 20,
  },
  scanTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  scanSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' },

  middleRow: { flexDirection: 'row', height: BOX },
  darkSide: { flex: 1, backgroundColor: DARK },
  scanBox: { width: BOX, height: BOX, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#009688', borderWidth: BORDER },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },

  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  scanningText: { color: '#fff', fontWeight: '700' },

  bottomOverlay: {
    flex: 1, backgroundColor: DARK,
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  scanHintBox: {
    backgroundColor: 'rgba(0,150,136,0.3)',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,150,136,0.5)',
  },
  scanHintText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  resultCard: {
    width: '90%', borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  successCard: { backgroundColor: '#e0f2f1', borderWidth: 1.5, borderColor: '#4db6ac' },
  errorCard: { backgroundColor: '#fdecea', borderWidth: 1.5, borderColor: '#ef9a9a' },
  resultIcon: { fontSize: 56, marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#263238', marginBottom: 8 },
  resultMsg: { fontSize: 14, color: '#546e7a', textAlign: 'center', lineHeight: 20 },
});
