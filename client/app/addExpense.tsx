import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.240.50.40:5000';

const CATEGORIES = [
  { label: 'Food',          icon: '🍔', color: '#FF6B6B' },
  { label: 'Travel',        icon: '✈️', color: '#4ECDC4' },
  { label: 'Health',        icon: '💊', color: '#45B7D1' },
  { label: 'Entertainment', icon: '🎬', color: '#A78BFA' },
  { label: 'Shopping',      icon: '🛍️', color: '#FB923C' },
  { label: 'Bills',         icon: '📄', color: '#FACC15' },
  { label: 'Others',        icon: '📦', color: '#94A3B8' },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function AddExpense() {
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('');
  const [loading, setLoading]         = useState(false);

  const selectedCat = CATEGORIES.find(c => c.label === category);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe what this expense is for.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          description: description.trim(),
          category: category || 'Pending',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ Saved', 'Expense added successfully!', [
          { text: 'Add Another', onPress: () => { setAmount(''); setDescription(''); setCategory(''); } },
          { text: 'Go Back', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.message ?? 'Something went wrong.');
      }
    } catch (error: any) {
      Alert.alert('Network Error', 'Could not connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F172A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Expense</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>How much?</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor="#475569"
              value={amount}
              onChangeText={v => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => setAmount(String(amt))}
                style={[styles.quickChip, amount === String(amt) && styles.quickChipActive]}
              >
                <Text style={[styles.quickChipText, amount === String(amt) && styles.quickChipTextActive]}>
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="e.g. Dinner at a restaurant"
            placeholderTextColor="#475569"
            value={description}
            onChangeText={setDescription}
            style={styles.textInput}
            multiline
            maxLength={120}
          />
          <Text style={styles.charCount}>{description.length}/120</Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Category{' '}
            <Text style={{ color: '#475569', fontWeight: '400', fontSize: 13 }}>
              (optional — auto-detected)
            </Text>
          </Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => {
              const active = category === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setCategory(active ? '' : cat.label)}
                  style={[
                    styles.catCard,
                    {
                      borderColor: active ? cat.color : '#1E293B',
                      backgroundColor: active ? cat.color + '22' : '#1E293B',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, { color: active ? cat.color : '#94A3B8' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        {(amount || description) && (
          <View style={[styles.previewCard, { borderLeftColor: selectedCat?.color ?? '#6366F1' }]}>
            <Text style={styles.previewTitle}>PREVIEW</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.previewDesc}>{description || 'Expense'}</Text>
                <Text style={[styles.previewCat, { color: selectedCat?.color ?? '#6366F1' }]}>
                  {selectedCat?.icon} {category || 'Auto-categorized'}
                </Text>
              </View>
              <Text style={styles.previewAmt}>₹{amount || '0'}</Text>
            </View>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save Expense</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 28, marginTop: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },

  amountCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, marginBottom: 16 },
  amountLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  amountRow:   { flexDirection: 'row', alignItems: 'center' },
  rupeeSign:   { color: '#6366F1', fontSize: 36, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, color: '#F1F5F9', fontSize: 52, fontWeight: '800', letterSpacing: -1 },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
  },
  quickChipActive:     { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  quickChipText:       { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  quickChipTextActive: { color: '#fff' },

  section:   { marginBottom: 20 },
  label:     { color: '#F1F5F9', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  textInput: {
    backgroundColor: '#1E293B', color: '#F1F5F9',
    borderRadius: 14, padding: 16, fontSize: 15,
    borderWidth: 1, borderColor: '#334155',
    minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { color: '#475569', fontSize: 12, textAlign: 'right', marginTop: 4 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '30%', aspectRatio: 1, borderRadius: 16,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center',
  },
  catLabel: { fontSize: 12, fontWeight: '600' },

  previewCard: {
    backgroundColor: '#1E293B', borderRadius: 16,
    padding: 16, marginBottom: 20, borderLeftWidth: 4,
  },
  previewTitle: {
    color: '#475569', fontSize: 11, fontWeight: '700',
    marginBottom: 10, letterSpacing: 1,
  },
  previewDesc: { color: '#F1F5F9', fontSize: 15, fontWeight: '600' },
  previewCat:  { fontSize: 13, marginTop: 4, fontWeight: '500' },
  previewAmt:  { color: '#F1F5F9', fontSize: 28, fontWeight: '800' },

  saveBtn: {
    backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});