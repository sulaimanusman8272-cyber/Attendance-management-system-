import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';

const tiles = [
  { label: 'My Courses',  icon: '📚', screen: 'Courses',    color: '#009688', light: '#e0f2f1' },
  { label: 'Scan QR',     icon: '📷', screen: 'ScanQR',     color: '#00796b', light: '#b2dfdb' },
  { label: 'Attendance',  icon: '📊', screen: 'Attendance', color: '#004d40', light: '#a7ffeb' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#004d40" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
            <Text style={styles.role}>{user?.role?.toUpperCase()} · Institution #{user?.institution_id}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ready to mark attendance?</Text>
          <Text style={styles.infoDesc}>Tap "Scan QR" and point your camera at the QR code shown by your teacher.</Text>
        </View>
      </View>

      {/* Tiles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {tiles.map(tile => (
            <TouchableOpacity
              key={tile.label}
              style={[styles.tile, { backgroundColor: tile.color }]}
              onPress={() => navigation.navigate(tile.screen)}
              activeOpacity={0.85}
            >
              <Text style={styles.tileIcon}>{tile.icon}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsCard}>
          {[
            { num: '1', text: 'Teacher starts an attendance session' },
            { num: '2', text: 'QR code appears on teacher\'s screen' },
            { num: '3', text: 'You tap "Scan QR" and scan it' },
            { num: '4', text: 'Attendance marked instantly!' },
          ].map(step => (
            <View key={step.num} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f4' },
  header: {
    backgroundColor: '#004d40',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '800' },
  role: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3, letterSpacing: 0.5 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#009688',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  infoTitle: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  infoDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#546e7a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  tilesGrid: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1, borderRadius: 16, padding: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  tileIcon: { fontSize: 28, marginBottom: 8 },
  tileLabel: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  stepsCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 16,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { color: '#009688', fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, color: '#546e7a', fontSize: 14, lineHeight: 20 },
});
