import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.greeting}>Hello, {user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#1a73e8' }]}
          onPress={() => navigation.navigate('Courses')}
        >
          <Text style={styles.tileIcon}>📚</Text>
          <Text style={styles.tileLabel}>My Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#2e7d32' }]}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileLabel}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#6a1b9a' }]}
          onPress={() => navigation.navigate('Attendance')}
        >
          <Text style={styles.tileIcon}>📋</Text>
          <Text style={styles.tileLabel}>My Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#e53935' }]}
          onPress={logout}
        >
          <Text style={styles.tileIcon}>🚪</Text>
          <Text style={styles.tileLabel}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How to Mark Attendance</Text>
        <Text style={styles.infoStep}>1. Your teacher will display a QR code</Text>
        <Text style={styles.infoStep}>2. Tap "Scan QR" above</Text>
        <Text style={styles.infoStep}>3. Point your camera at the QR code</Text>
        <Text style={styles.infoStep}>4. Attendance is marked instantly</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  welcome: {
    backgroundColor: '#1a73e8',
    padding: 24,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  role: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  tile: {
    width: '47%',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tileIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  tileLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 12,
  },
  infoStep: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
});
