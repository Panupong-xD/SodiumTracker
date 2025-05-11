// src/components/ConsumptionHistoryItem.js
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatSodiumAmount } from '../utils/sodiumCalculator';
import colors from '../constants/colors';

const ConsumptionHistoryItem = ({ item, isDeletable, onDelete }) => {
  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')} น.`;
  };

  const confirmDelete = () =>
    Alert.alert(
      'ลบรายการนี้?',
      `ต้องการลบ "${item.foodName}" ออกจากประวัติวันนี้หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => onDelete(item.id) },
      ],
    );

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.foodName}>{item.foodName}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.sodiumContainer}>
            <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.sodiumText}>{formatSodiumAmount(item.sodiumAmount)}</Text>
          </View>

          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      </View>

      {isDeletable && (
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contentContainer: { flex: 1 },
  foodName: { fontSize: 16, fontFamily: 'Kanit-Regular', color: colors.textPrimary, marginBottom: 4 },
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  sodiumContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  sodiumText: { marginLeft: 4, fontSize: 14, fontFamily: 'Kanit-Regular', color: colors.textSecondary },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  timeText: { marginLeft: 4, fontSize: 14, fontFamily: 'Kanit-Regular', color: colors.textSecondary },
  deleteBtn: { paddingHorizontal: 8, alignSelf: 'center' },
});

export default ConsumptionHistoryItem;