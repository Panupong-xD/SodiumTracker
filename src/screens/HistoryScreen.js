// src/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getConsumptionHistory,
  clearConsumptionHistory,
  removeConsumptionById,
} from '../utils/storage';
import ConsumptionHistoryItem from '../components/ConsumptionHistoryItem';
import colors from '../constants/colors';


const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getConsumptionHistory();
      const sorted = data
        ? [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        : [];
      setHistory(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error(err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  /* โหลดใหม่ทุกครั้งที่หน้า History กลับมาโฟกัส */
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  /* ค้นหา */
  const onSearchChange = (txt) => {
    setSearch(txt);
    if (!txt.trim()) return setFiltered(history);
    const f = history.filter((it) =>
      it.foodName.toLowerCase().includes(txt.trim().toLowerCase()),
    );
    setFiltered(f);
  };

  const handleDeleteTodayItem = async (id) => {
    await removeConsumptionById(id);
    loadHistory();
  };

  const handleClearHistory = () => {
    Alert.alert('ลบประวัติทั้งหมด', 'คุณต้องการลบประวัติการบริโภคทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบทั้งหมด',
        style: 'destructive',
        onPress: async () => {
          await clearConsumptionHistory();
          loadHistory();
          Alert.alert('สำเร็จ', 'ลบประวัติทั้งหมดเรียบร้อยแล้ว');
        },
      },
    ]);
  };

  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  const groupByDate = (list) => {
    const grouped = {};
    list.forEach((it) => {
      const d = new Date(it.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(it);
    });
    return Object.entries(grouped).map(([k, items]) => ({
      title: formatHeader(new Date(items[0].timestamp)),
      data: items,
    }));
  };

  const formatHeader = (date) => {
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'วันนี้';
    if (date.toDateString() === yest.toDateString()) return 'เมื่อวาน';
    const monthTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${monthTH[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  const renderSection = ({ item }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
      </View>
      {item.data.map((h) => (
        <ConsumptionHistoryItem
          key={h.id}
          item={h}
          isDeletable={isToday(h.timestamp)}
          onDelete={handleDeleteTodayItem}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>ประวัติการบริโภค</Text>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearRow} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.clearTxt}>ลบทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหารายการอาหาร..."
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTxt}>กำลังโหลด...</Text>
        </View>
      ) : filtered.length ? (
        <FlatList
          data={groupByDate(filtered)}
          keyExtractor={(i) => i.title}
          renderItem={renderSection}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.emptyTxt}>ไม่พบประวัติ</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  header: { fontSize: 18, fontFamily: 'Kanit-Bold', color: colors.textPrimary },
  clearRow: { flexDirection: 'row', alignItems: 'center' },
  clearTxt: { marginLeft: 4, fontSize: 14, fontFamily: 'Kanit-Regular', color: colors.danger },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16, fontFamily: 'Kanit-Regular' },

  section: { marginBottom: 16, backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  sectionHeader: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: colors.primaryLight, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 16, fontFamily: 'Kanit-Bold', color: colors.primary },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTxt: { marginTop: 10, fontSize: 16, fontFamily: 'Kanit-Regular', color: colors.textSecondary },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { marginTop: 16, fontSize: 18, fontFamily: 'Kanit-Bold', color: colors.textSecondary },
});

export default HistoryScreen;
