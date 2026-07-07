import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState({ institution_id: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.institution_id || !form.email || !form.password) {
      return Alert.alert('Error', 'All fields are required.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        institution_id: parseInt(form.institution_id),
        email: form.email,
        password: form.password,
      });
      await login(res.data.user, res.data.token);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>AMS</Text>
          <Text style={styles.logoSub}>Attendance Management System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Student Login</Text>

          <Text style={styles.label}>Institution ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter institution ID"
            keyboardType="numeric"
            value={form.institution_id}
            onChangeText={v => setForm({ ...form, institution_id: v })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={form.password}
            onChangeText={v => setForm({ ...form, password: v })}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
