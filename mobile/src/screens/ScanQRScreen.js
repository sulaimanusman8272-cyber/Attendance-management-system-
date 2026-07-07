import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api/axios';

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error'
  const [resultMsg, setResultMsg] = useState('');

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setResult(null);

    try {
      await api.post('/attendance/mark', { qr_token: data });
      setResult('success');
      setResultMsg('Attendance marked successfully!');
    } catch (err) {
      setResult('error');
      setResultMsg(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setResult(null);
    setResultMsg('');
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera permission is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.center}>
        <View style={[styles.resultBox, result === 'success' ? styles.successBox : styles.errorBox]}>
          <Text style={styles.resultIcon}>{result === 'success' ? '✓' : '✗'}</Text>
          <Text style={styles.resultMsg}>{resultMsg}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleScanAgain}>
          <Text style={styles.btnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          {loading
            ? <ActivityIndicator size="large" color="#fff" />
            : <Text style={styles.scanHint}>Point camera at the QR code to mark attendance</Text>
          }
        </View>
      </View>
    </View>
  );
}

const SCAN_BOX = 250;
const OVERLAY_COLOR = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 24,
  },
  permText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_BOX,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  scanBox: {
    width: SCAN_BOX,
    height: SCAN_BOX,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#1a73e8',
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  bottomOverlay: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center',
    paddingTop: 24,
  },
  scanHint: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  resultBox: {
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    width: '80%',
  },
  successBox: { backgroundColor: '#e8f5e9' },
  errorBox: { backgroundColor: '#fdecea' },
  resultIcon: { fontSize: 50, marginBottom: 12 },
  resultMsg: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#333' },
  btn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
