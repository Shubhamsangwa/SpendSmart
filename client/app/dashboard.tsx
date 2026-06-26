import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.240.50.40:5000';
const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  Food:          { color: '#FF6B6B', icon: '🍔' },
  Travel:        { color: '#4ECDC4', icon: '✈️' },
  Health:        { color: '#45B7D1', icon: '💊' },
  Entertainment: { color: '#A78BFA', icon: '🎬' },
  Shopping:      { color: '#FB923C', icon: '🛍️' },
  Bills:         { color: '#FACC15', icon: '📄' },
  Others:        { color: '#94A3B8', icon: '📦' },
};

function getCategoryColor(cat: string) {
  return CATEGORY_CONFIG[cat]?.color ?? '#94A3B8';
}
function getCategoryIcon(cat: string) {
  return CATEGORY_CONFIG[cat]?.icon ?? '📦';
}

// Helper to get token
async function getToken() {
  return await AsyncStorage.getItem('token');
}

export default function Dashboard() {
  const [expenses, setExpenses]             = useState<any[]>([]);
  const [total, setTotal]                   = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [darkMode, setDarkMode]             = useState(false);
  const [search, setSearch]                 = useState('');
  const [highestCategory, setHighestCategory] = useState('');
  const [highestAmount, setHighestAmount]   = useState(0);
  const [averageExpense, setAverageExpense] = useState(0);
  const [suggestion, setSuggestion]         = useState('');
  const [monthlyBudget, setMonthlyBudget]   = useState<number | null>(null);
  const [activeFilter, setActiveFilter]     = useState('All');
  const [userName, setUserName]             = useState('');

  const FILTERS = ['All', 'Food', 'Travel', 'Health', 'Entertainment', 'Shopping', 'Bills', 'Others'];

  // Load dark mode, budget & user on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('darkMode').then(v => {
        if (v !== null) setDarkMode(JSON.parse(v));
      });
      AsyncStorage.getItem('monthlyBudget').then(v => {
        if (v !== null) setMonthlyBudget(Number(v));
      });
      AsyncStorage.getItem('user').then(v => {
        if (v !== null) {
          const u = JSON.parse(v);
          setUserName(u.name ?? '');
        }
      });
    }, [])
  );

  // Fetch expenses with auth token
  const fetchExpenses = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any[] = await res.json();
      setExpenses(data);

      let sum = 0;
      const cats: Record<string, number> = {
        Food: 0, Travel: 0, Health: 0, Entertainment: 0,
        Shopping: 0, Bills: 0, Others: 0,
      };

      data.forEach(item => {
        sum += item.amount;
        if (cats[item.category] !== undefined) cats[item.category] += item.amount;
        else cats['Others'] += item.amount;
      });

      setTotal(sum);
      setCategoryTotals(cats);

      let maxCat = 'Others';
      let maxAmt = 0;
      Object.entries(cats).forEach(([cat, amt]) => {
        if (amt > maxAmt) { maxCat = cat; maxAmt = amt; }
      });
      setHighestCategory(maxCat);
      setHighestAmount(maxAmt);
      setAverageExpense(data.length > 0 ? Math.round(sum / data.length) : 0);

      const tips: Record<string, string> = {
        Food:          'You spend most on food. Try cooking at home more often.',
        Travel:        'Travel is your top spend — consider public transport.',
        Health:        'Health spending is high. Stay consistent with prevention.',
        Entertainment: 'Set a monthly cap on entertainment to save more.',
        Shopping:      'Shopping is your top category. Try a weekly budget for it.',
        Bills:         'Bills are under control. Keep tracking!',
        Others:        'Your spending is balanced. Keep it up! 🎉',
      };
      setSuggestion(tips[maxCat] ?? tips.Others);
    } catch (err) {
      console.log('Fetch error:', err);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchExpenses(); }, [fetchExpenses]));

  // Delete with token
  const confirmDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const token = await getToken();
          await fetch(`${BASE_URL}/expense/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchExpenses();
        },
      },
    ]);
  };

  // Logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          router.replace('/');
        },
      },
    ]);
  };

  const budgetUsedPct = monthlyBudget ? Math.min((total / monthlyBudget) * 100, 100) : null;
  const overBudget    = monthlyBudget ? total > monthlyBudget : false;

  const filteredExpenses = expenses.filter(item => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  // Theme
  const bg      = darkMode ? '#0F172A' : '#F8FAFC';
  const card    = darkMode ? '#1E293B' : '#FFFFFF';
  const text    = darkMode ? '#F1F5F9' : '#0F172A';
  const subtext = darkMode ? '#94A3B8' : '#64748B';
  const border  = darkMode ? '#334155' : '#E2E8F0';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={bg} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: subtext }]}>Welcome back 👋</Text>
            <Text style={[styles.appName, { color: text }]}>
              {userName ? userName.split(' ')[0] : 'SpendSmart'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: card, borderColor: border }]}
              onPress={() => router.push('/settings')}
            >
              
              <Ionicons name="settings-outline" size={22} color={text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: card, borderColor: border }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Card */}
        <View style={[styles.totalCard, { backgroundColor: '#6366F1' }]}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>

          {monthlyBudget && (
            <View style={{ marginTop: 14 }}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>
                  Budget: ₹{monthlyBudget.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.budgetLabel, overBudget && { color: '#FCA5A5' }]}>
                  {overBudget ? '⚠️ Over budget!' : `${Math.round(budgetUsedPct!)}% used`}
                </Text>
              </View>
              <View style={styles.budgetBarBg}>
                <View
                  style={[
                    styles.budgetBarFill,
                    {
                      width: `${budgetUsedPct}%` as any,
                      backgroundColor: overBudget ? '#EF4444' : '#A5F3FC',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Category pills */}
          <View style={styles.pillRow}>
            {Object.entries(categoryTotals).map(([cat, amt]) =>
              amt > 0 ? (
                <View key={cat} style={styles.pill}>
                  <Text style={styles.pillText}>
                    {getCategoryIcon(cat)} ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </View>
              ) : null
            )}
          </View>
        </View>

        {/* AI Insights */}
        {expenses.length > 0 && (
          <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: text }]}>🤖 AI Insights</Text>

            <View style={styles.insightRow}>
              <View style={[styles.insightBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.insightBadgeText}>🔥 Top</Text>
              </View>
              <Text style={[styles.insightText, { color: text }]}>
                {highestCategory} — ₹{highestAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.insightRow}>
              <View style={[styles.insightBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.insightBadgeText}>📊 Avg</Text>
              </View>
              <Text style={[styles.insightText, { color: text }]}>
                ₹{averageExpense.toLocaleString('en-IN')} per expense
              </Text>
            </View>

            <View style={[styles.suggestionBox, { backgroundColor: darkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Text style={[styles.suggestionText, { color: darkMode ? '#6EE7B7' : '#065F46' }]}>
                💡 {suggestion}
              </Text>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: card, borderColor: border }]}>
          <Ionicons name="search-outline" size={18} color={subtext} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search expenses..."
            placeholderTextColor={subtext}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={subtext} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f ? '#6366F1' : card,
                  borderColor: activeFilter === f ? '#6366F1' : border,
                },
              ]}
            >
              {f !== 'All' && (
                <Text style={{ fontSize: 12, marginRight: 4 }}>{getCategoryIcon(f)}</Text>
              )}
              <Text style={{ color: activeFilter === f ? '#fff' : subtext, fontWeight: '600', fontSize: 13 }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expense List */}
        <Text style={[styles.sectionTitle, { color: text, marginBottom: 12 }]}>
          Recent Expenses{'  '}
          <Text style={{ color: subtext, fontWeight: '400', fontSize: 14 }}>
            {filteredExpenses.length} items
          </Text>
        </Text>

        {filteredExpenses.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: card, borderColor: border }]}>
            <Text style={{ fontSize: 36 }}>💸</Text>
            <Text style={{ color: text, fontWeight: '600', fontSize: 16, marginTop: 8 }}>
              No expenses found
            </Text>
            <Text style={{ color: subtext, marginTop: 4, textAlign: 'center', fontSize: 13 }}>
              {search ? 'Try a different search term.' : 'Tap + to add your first expense.'}
            </Text>
          </View>
        )}

        {filteredExpenses.map((item, index) => (
          <View
            key={item._id ?? index}
            style={[styles.expenseCard, { backgroundColor: card, borderColor: border }]}
          >
            <View style={[styles.cardAccent, { backgroundColor: getCategoryColor(item.category) }]} />

            <View style={{ flex: 1 }}>
              <View style={styles.cardTop}>
                <Text style={{ fontSize: 20 }}>{getCategoryIcon(item.category)}</Text>
                <Text style={[styles.cardAmount, { color: text }]}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={[styles.cardDesc, { color: text }]}>{item.description}</Text>
              <View style={styles.cardBottom}>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) + '22' }]}>
                  <Text style={[styles.categoryTagText, { color: getCategoryColor(item.category) }]}>
                    {item.category}
                  </Text>
                </View>
                <Text style={[styles.cardDate, { color: subtext }]}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item._id)}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addExpense')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: '500' },
  appName:  { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  totalCard: {
    borderRadius: 24, padding: 24, marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  totalLabel:  { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500' },
  totalAmount: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  budgetRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  budgetLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
  budgetBarBg: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, height: 6 },
  budgetBarFill: { height: 6, borderRadius: 99 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  section: {
    borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },

  insightRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  insightBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  insightBadgeText: { fontSize: 12, fontWeight: '700' },
  insightText:      { fontSize: 15, fontWeight: '500' },
  suggestionBox:    { borderRadius: 12, padding: 12, marginTop: 6 },
  suggestionText:   { fontSize: 14, fontWeight: '500', lineHeight: 20 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },

  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1, marginRight: 8,
  },

  expenseCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1,
    padding: 14, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardAccent:      { width: 4, borderRadius: 99, alignSelf: 'stretch', marginRight: 14 },
  cardTop:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardAmount:      { fontSize: 20, fontWeight: '700' },
  cardDesc:        { fontSize: 14, fontWeight: '400', marginBottom: 8 },
  cardBottom:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryTag:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  categoryTagText: { fontSize: 12, fontWeight: '700' },
  cardDate:        { fontSize: 12 },
  deleteBtn:       { padding: 10, marginLeft: 8, borderRadius: 10 },

  emptyState: {
    borderRadius: 20, borderWidth: 1,
    padding: 32, alignItems: 'center', marginBottom: 16,
  },

  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
});