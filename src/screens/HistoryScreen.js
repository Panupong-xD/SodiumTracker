import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getConsumptionHistory, clearConsumptionHistory } from '../utils/storage';
import ConsumptionHistoryItem from '../components/ConsumptionHistoryItem';
import colors from '../constants/colors';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getConsumptionHistory();
      
      // Sort by timestamp (newest first)
      const sortedData = data ? 
        [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
        : [];
      
      setHistory(sortedData);
    } catch (error) {
      console.error('Error loading consumption history:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประวัติการบริโภคได้');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'ลบประวัติทั้งหมด',
      'คุณต้องการลบประวัติการบริโภคทั้งหมดหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบทั้งหมด',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearConsumptionHistory();
              setHistory([]);
              Alert.alert('สำเร็จ', 'ลบประวัติการบริโภคทั้งหมดเรียบร้อยแล้ว');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบประวัติการบริโภคได้');
            }
          },
        },
      ]
    );
  };

  const groupHistoryByDate = () => {
    const grouped = {};
    
    history.forEach(item => {
      const date = new Date(item.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          title: formatDate(date),
          data: [],
        };
      }
      
      grouped[dateKey].data.push(item);
    });
    
    return Object.values(grouped);
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'วันนี้';
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'เมื่อวาน';
    } else {
      const day = date.getDate();
      const month = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()];
      const year = date.getFullYear() + 543; // Convert to Buddhist Era
      return `${day} ${month} ${year}`;
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
        {item.data.map(historyItem => (
          <ConsumptionHistoryItem key={historyItem.id} item={historyItem} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ประวัติการบริโภค</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.clearButtonText}>ลบทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดประวัติ...</Text>
        </View>
      ) : history.length > 0 ? (
        <FlatList
          data={groupHistoryByDate()}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.emptyText}>ไม่มีประวัติการบริโภค</Text>
          <Text style={styles.emptySubText}>
            เมื่อคุณบันทึกการบริโภคอาหาร ข้อมูลจะปรากฏที่นี่
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Kanit-Bold',
    color: colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.danger,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Kanit-Bold',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Kanit-Bold',
    color: colors.textSecondary,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;
