import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Settings() {
  const [darkMode, setDarkMode]         = useState(false);
  const [budgetInput, setBudgetInput]   = useState('');
  const [savedBudget, setSavedBudget]   = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(v => {
      if (v !== null) setDarkMode(JSON.parse(v));
    });
    AsyncStorage.getItem('monthlyBudget').then(v => {
      if (v !== null) setSavedBudget(v);
    });
  }, []);

  const toggleTheme = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  const saveBudget = async () => {
    const num = Number(budgetInput);
    if (!budgetInput || isNaN(num) || num <= 0) {
      Alert.alert('Invalid Budget', 'Enter a valid budget amount.');
      return;
    }
    await AsyncStorage.setItem('monthlyBudget', String(num));
    setSavedBudget(String(num));
    setBudgetInput('');
    Alert.alert('✅ Budget Set', `Monthly budget set to ₹${num.toLocaleString('en-IN')}`);
  };

  const clearBudget = async () => {
    await AsyncStorage.removeItem('monthlyBudget');
    setSavedBudget(null);
  };

  // ─── Theme ─────────────────────────────────────────────────────────────────
  const bg      = darkMode ? '#0F172A' : '#F8FAFC';
  const card    = darkMode ? '#1E293B' : '#FFFFFF';
  const text    = darkMode ? '#F1F5F9' : '#0F172A';
  const subtext = darkMode ? '#94A3B8' : '#64748B';
  const border  = darkMode ? '#334155' : '#E2E8F0';

  const Row = ({
    icon, iconBg, label, children,
  }: {
    icon: string; iconBg: string; label: string; children: React.ReactNode;
  }) => (
    <View style={[styles.row, { borderBottomColor: border }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color="#fff" />
      </View>
      <Text style={[styles.rowLabel, { color: text }]}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={bg} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="arrow-back" size={20} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Appearance ── */}
        <Text style={[styles.groupLabel, { color: subtext }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
          <Row icon="moon" iconBg="#6366F1" label="Dark Mode">
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
              thumbColor="#fff"
            />
          </Row>
        </View>

        {/* ── Budget ── */}
        <Text style={[styles.groupLabel, { color: subtext }]}>BUDGET</Text>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>

          {savedBudget ? (
            <View style={styles.budgetDisplay}>
              <View>
                <Text style={[styles.budgetTitle, { color: text }]}>Monthly Budget</Text>
                <Text style={styles.budgetAmt}>
                  ₹{Number(savedBudget).toLocaleString('en-IN')}
                </Text>
              </View>
              <TouchableOpacity onPress={clearBudget} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.clearBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.noBudgetText, { color: subtext }]}>
              No monthly budget set. Add one to track your spending limit on the dashboard.
            </Text>
          )}

          <View style={[styles.budgetInputRow, { borderTopColor: border }]}>
            <Text style={[styles.rupee, { color: subtext }]}>₹</Text>
            <TextInput
              placeholder={savedBudget ? 'Update budget...' : 'Set monthly budget...'}
              placeholderTextColor={subtext}
              value={budgetInput}
              onChangeText={v => setBudgetInput(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={[styles.budgetInput, { color: text }]}
            />
            <TouchableOpacity
              onPress={saveBudget}
              style={[styles.saveBtn, !budgetInput && { opacity: 0.4 }]}
              disabled={!budgetInput}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── About ── */}
        <Text style={[styles.groupLabel, { color: subtext }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
          <Row icon="information-circle" iconBg="#45B7D1" label="Version">
            <Text style={[styles.aboutValue, { color: subtext }]}>1.0.0</Text>
          </Row>
          <Row icon="code-slash" iconBg="#4ECDC4" label="Built with">
            <Text style={[styles.aboutValue, { color: subtext }]}>React Native + Node.js</Text>
          </Row>
          <Row icon="school" iconBg="#A78BFA" label="About this App">
            <Text style={[styles.aboutValue, { color: subtext }]}>CSE 3rd Year Student Project</Text>
          </Row>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  rowLabel:  { flex: 1, fontSize: 15, fontWeight: '500' },
  rowRight:  { alignItems: 'flex-end' },
  aboutValue: { fontSize: 13 },

  budgetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  budgetTitle: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  budgetAmt:   { fontSize: 28, fontWeight: '800', color: '#6366F1' },
  clearBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  noBudgetText: { fontSize: 13, padding: 16, lineHeight: 20 },

  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  rupee:       { fontSize: 18, fontWeight: '700' },
  budgetInput: { flex: 1, fontSize: 16, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});