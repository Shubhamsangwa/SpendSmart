import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://10.240.50.40:5000';

export default function HomeScreen() {
  const [mode, setMode]               = useState<'login' | 'register'>('login');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.'); return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.'); return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return false;
    }
    return true;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body     = mode === 'login'
      ? { email: email.trim().toLowerCase(), password }
      : { name: name.trim(), email: email.trim().toLowerCase(), password };

    try {
      const res  = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message ?? 'Something went wrong.');
        return;
      }

      // Save token & user info
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Network Error', 'Could not reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setName(''); setEmail(''); setPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F172A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo area ── */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💸</Text>
          </View>
          <Text style={styles.appName}>SpendSmart</Text>
          <Text style={styles.tagline}>Track every rupee. Own every decision.</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>

          {/* Tab toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => mode !== 'login' && toggleMode()}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => mode !== 'register' && toggleMode()}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name field (register only) */}
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#475569" style={styles.inputIcon} />
                <TextInput
                  placeholder="Ravi Kumar"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#475569" style={styles.inputIcon} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#475569" style={styles.inputIcon} />
              <TextInput
                placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ paddingRight: 14 }}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password (login only) */}
          {mode === 'login' && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login' ? 'Login to Account' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch mode */}
          <TouchableOpacity onPress={toggleMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Register' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.footerText}>
          Your data is stored securely on your own server.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },

  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: { fontSize: 32 },
  appName:   { color: '#F1F5F9', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  tagline:   { color: '#64748B', fontSize: 13, marginTop: 6, textAlign: 'center' },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive:     { backgroundColor: '#6366F1' },
  tabText:       { color: '#64748B', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },

  fieldGroup: { marginBottom: 16 },
  label:      { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  forgotText: { color: '#6366F1', fontSize: 13, fontWeight: '500', marginBottom: 24 },

  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  switchRow: { alignItems: 'center' },
  switchText: { color: '#64748B', fontSize: 13 },
  switchLink: { color: '#6366F1', fontWeight: '700' },

  footerText: {
    color: '#334155',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});