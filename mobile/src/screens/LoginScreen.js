import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar
} from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState({ institution_id: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.institution_id || !form.email || !form.password)
      return Alert.alert('Missing Fields', 'All fields are required.');
    setLoading(true);
    try {
      console.log('Attempting login to:', 'http://192.168.0.106:5000/api/auth/login');
      console.log('Body:', { institution_id: parseInt(form.institution_id), email: form.email });
      const res = await api.post('/auth/login', {
        institution_id: parseInt(form.institution_id),
        email: form.email,
        password: form.password,
      });
      console.log('Login success:', res.data);
      if (res.data.user.role !== 'student') {
        Alert.alert('Access Denied', 'This app is for students only. Please use the web portal.');
        return;
      }
      await login(res.data.user, res.data.token);
    } catch (err) {
      console.log('Login error:', err.message, err.code, err.response?.status);
      const msg = err.response?.data?.message || err.message || 'Network error - check connection';
      Alert.alert('Login Failed', msg);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#004d40" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>AMS</Text>
          </View>
          <Text style={styles.title}>Attendance System</Text>
          <Text style={styles.subtitle}>Sign in to mark your attendance</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <Text style={styles.label}>Institution ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1"
            placeholderTextColor="#90a4ae"
            keyboardType="numeric"
            value={form.institution_id}
            onChangeText={v => setForm({ ...form, institution_id: v })}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@university.edu"
            placeholderTextColor="#90a4ae"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Admin@123"
              placeholderTextColor="#90a4ae"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={v => setForm({ ...form, password: v })}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign In →</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {['QR Code Attendance', 'Real-time Tracking', 'Instant Reports'].map(f => (
            <View key={f} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#004d40',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#00897b',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#263238', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#546e7a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderColor: '#cfd8dc', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#263238', backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  eyeBtn: { padding: 12, marginLeft: 8 },
  eyeIcon: { fontSize: 18 },
  btn: {
    backgroundColor: '#009688', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#009688', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  features: { marginTop: 28, gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4db6ac' },
  featureText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
});
