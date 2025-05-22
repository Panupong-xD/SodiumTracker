import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

import { getConsumptionHistory, getProfileData } from '../utils/storage';
import ChartContainer from '../components/ChartContainer';
import colors from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [period, setPeriod] = useState('weekly');
  const [consumptionData, setConsumptionData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [averageSodium, setAverageSodium] = useState(null);

  const getSodiumAdvice = (pct, rec) => {
    if (pct < 25)
      return `⚠️ โซเดียมต่ำมาก (≈${pct}% ของ ${rec} มก.)\n• สังเกตอาการวิงเวียน‑อ่อนแรง\n• เติมเกลือเล็กน้อยในมื้อถัดไปหรือเลือกโปรตีนธรรมชาติ เช่น ปลา\n• หากมีอาการผิดปกติให้ปรึกษาแพทย์`;
    if (pct < 75)
      return `โซเดียมยังต่ำกว่าที่แนะนำ (≈${pct}%)\n• เพิ่มแหล่งโซเดียมคุณภาพ เช่น ไข่ นมพร่องมันเนย`;
    if (pct < 115)
      return `✅ อยู่ในเกณฑ์เหมาะสม\n• รักษาพฤติกรรมอาหารสด ลดซอสเค็ม\n• ดื่มน้ำตามปกติ`;
    if (pct <= 175)
      return `⚠️ โซเดียมสูงกว่าแนะนำ (≈${pct}%)\n• ลด/งดอาหารแปรรูป‑เค็มตลอดวัน\n• ดื่มน้ำสะอาดเพิ่ม (ภายใต้คำแนะนำแพทย์)`;
    return `🚨 โซเดียมเกินขั้นอันตราย (>175%)\n• งดเกลือและของเค็มทันที\n• เช็กความดัน/อาการบวม\n• พบแพทย์ด่วนหากมีอาการหนัก`;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [history, profileData] = await Promise.all([
        getConsumptionHistory(),
        getProfileData(),
      ]);
      setConsumptionData(history || []);
      setProfile(profileData);
    } catch (err) {
      console.error(err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (consumptionData.length > 0) {
      processData();
    } else {
      setChartData({ labels: [], datasets: [{ data: [] }] });
      setDailyData(null);
      setAverageSodium(null);
    }
  }, [consumptionData, period]);

  const processData = () => {
    const sortedData = [...consumptionData].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const groupedByDay = sortedData.reduce((acc, item) => {
      const date = new Date(item.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      if (!acc[key]) acc[key] = { date: key, totalSodium: 0, items: [] };
      acc[key].totalSodium += parseInt(item.sodiumAmount, 10);
      acc[key].items.push(item);
      return acc;
    }, {});

    const dailyArray = Object.values(groupedByDay);
    setDailyData(dailyArray);

    let labels = [];
    let dataPoints = [];
    let recommendedData = [];

    const recommendedSodium = parseInt(profile?.recommendedSodium, 10) || 2000;

    if (period === 'weekly') {
      const last7 = getLast7Days();
      labels = last7.map(d => {
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      dataPoints = last7.map(d => groupedByDay[d]?.totalSodium || 0);
      recommendedData = Array(last7.length).fill(recommendedSodium);

      const recordedDays = last7
        .map(date => dailyArray.find(item => item.date === date))
        .filter(item => item && item.totalSodium > 0);
      if (recordedDays.length > 0) {
        const totalSodium = recordedDays.reduce((sum, item) => sum + item.totalSodium, 0);
        const average = Math.round(totalSodium / recordedDays.length);
        setAverageSodium({ type: 'daily', value: average });
      } else {
        setAverageSodium(null);
      }
    } else if (period === 'monthly') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
      const monthData = [];
      labels.length = 0;
    
      for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
        const dayData = groupedByDay[dateKey];
    
        monthData.push(dayData ? dayData.totalSodium : 0);
    
        if (i % 5 === 0 || i === daysInMonth) {
          labels.push(i.toString());
        } else {
          labels.push('');
        }
      }
    
      dataPoints = monthData;
      recommendedData = Array(monthData.length).fill(recommendedSodium);

      const recordedDays = dailyArray.filter(item => {
        const [year, month] = item.date.split('-').map(Number);
        return year === currentYear && month === currentMonth + 1 && item.totalSodium > 0;
      });
      if (recordedDays.length > 0) {
        const totalSodium = recordedDays.reduce((sum, item) => sum + item.totalSodium, 0);
        const average = Math.round(totalSodium / recordedDays.length);
        setAverageSodium({ type: 'daily', value: average });
      } else {
        setAverageSodium(null);
      }
    } else if (period === 'yearly') {
      const year = new Date().getFullYear();
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const yearData = Array(12).fill(0);
      dailyArray.forEach(item => {
        const [y, m] = item.date.split('-').map(Number);
        if (y === year) yearData[m - 1] += item.totalSodium;
      });
      labels = monthNames;
      dataPoints = yearData;
      recommendedData = [];

      const recordedDays = dailyArray.filter(item => {
        const [y] = item.date.split('-').map(Number);
        return y === year && item.totalSodium > 0;
      });
    
      if (recordedDays.length > 0) {
        const totalSodium = recordedDays.reduce((sum, item) => sum + item.totalSodium, 0);
        const averageDailySodium = totalSodium / recordedDays.length;
        const daysInYear = new Date(year, 12, 0).getDate() === 31 ? 365 : 366;
        const averageDaysPerMonth = daysInYear / 12;
        const averageMonthlySodium = Math.round(averageDailySodium * averageDaysPerMonth);
        setAverageSodium({ type: 'monthly', value: averageMonthlySodium });
      } else {
        setAverageSodium(null);
      }
    }

    const datasets = [
      { data: dataPoints, color: (opacity = 1) => `rgba(12,97,112,${opacity})` },
    ];
    if (recommendedData.length > 0) {
      datasets.push({
        data: recommendedData,
        color: (opacity = 1) => `rgba(255,0,0,${opacity})`,
        strokeWidth: 2,
        withDots: false,
      });
    }

    setChartData({ labels, datasets });
  };

  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    return result;
  };

  const getTodayConsumption = () => {
    if (!dailyData || dailyData.length === 0) return 0;
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const todayData = dailyData.find(item => item.date === key);
    return todayData ? todayData.totalSodium : 0;
  };

  const getSodiumStatus = (percentage) => {
    if (percentage < 25) {
      return {
        message: 'โซเดียมน้อยเกินไป๊',
        color: '#FFC107',
        emoji: '😵‍💫',
      };
    } else if (percentage >= 25 && percentage < 75) {
      return {
        message: 'โซเดียมน้อยไปหน่อยนะ',
        color: '#85C17E',
        emoji: '😐',
      };
    } else if (percentage >= 75 && percentage < 115) {
      return {
        message: 'โซเดียมอยู่ในเกณฑ์ดีเยี่ยม',
        color: '#28A745',
        emoji: '😀',
      };
    } else if (percentage >= 115 && percentage <= 175) {
      return {
        message: 'โซเดียมสูงไปแล้วนะ',
        color: '#FF851B',
        emoji: '😟',
      };
    } else {
      return {
        message: 'โซเดียมสูงเกิ๊นอันตรายสุดๆ',
        color: '#DC3545',
        emoji: '😵',
      };
    }
  };

  const renderSummary = () => {
    if (!profile) {
      return (
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileText}>
            กรุณาตั้งค่าโปรไฟล์ของคุณที่หน้าโปรไฟล์
          </Text>
        </View>
      );
    }
    const recommended = parseInt(profile.recommendedSodium, 10) || 2000;
    const todayConsumption = getTodayConsumption();
    const percentage = Math.round((todayConsumption / recommended) * 100);
    const progressWidth = Math.min(percentage, 100);
    const sodiumStatus = getSodiumStatus(percentage);
    const pctToday = Math.round((getTodayConsumption() / recommended) * 100);

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>สรุปการบริโภคโซเดียมวันนี้</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressWidth}%`, backgroundColor: sodiumStatus.color }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{percentage}%</Text>
        </View>
        <View style={styles.recommendationContainer}>
          <Text style={[styles.recommendationText, { color: sodiumStatus.color }]}>
            {sodiumStatus.emoji} {sodiumStatus.message}
          </Text>
        </View>
        <View style={styles.sodiumInfoContainer}>
          <View style={styles.sodiumInfoItem}>
            <Text style={styles.sodiumLabel}>ปริมาณที่บริโภค</Text>
            <Text style={styles.sodiumValue}>{todayConsumption} มก.</Text>
          </View>
          <View style={styles.sodiumInfoDivider} />
          <View style={styles.sodiumInfoItem}>
            <Text style={styles.sodiumLabel}>ปริมาณที่แนะนำ</Text>
            <Text style={styles.sodiumValue}>{recommended} มก.</Text>
          </View>
        </View>
        {/* Moved advice section here */}
        <View style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>คำแนะนำประจำวัน</Text>
          <Text style={{ lineHeight: 22 }}>{getSodiumAdvice(pctToday, recommended)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          </View>
        ) : (
          <>
            {renderSummary()}
            <View style={styles.periodSelectorContainer}>
              {['weekly', 'monthly', 'yearly'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodButton,
                    period === p && styles.activePeriodButton
                  ]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    period === p && styles.activePeriodButtonText
                  ]}>
                    {p === 'weekly' ? '7 วันล่าสุด' : p === 'monthly' ? 'รายเดือน' : 'รายปี'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {chartData && (
              <ChartContainer title="ปริมาณโซเดียมที่บริโภค">
                {chartData.labels.length > 0 ? (
                  <LineChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.white,
                      backgroundGradientFrom: colors.white,
                      backgroundGradientTo: colors.white,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(12,97,112,${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>ไม่มีข้อมูลสำหรับแสดงในกราฟ</Text>
                  </View>
                )}
                {averageSodium && (
                  <View style={styles.averageContainer}>
                    <Text style={styles.averageLabel}>
                      {averageSodium.type === 'daily' ? 'ค่าเฉลี่ยโซเดียมต่อวัน: ' : 'ค่าเฉลี่ยโซเดียมต่อเดือน: '}
                      <Text style={styles.averageValue}>{averageSodium.value} มก.</Text>
                    </Text>
                  </View>
                )}
              </ChartContainer>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Kanit-Regular', color: colors.textSecondary },
  noProfileContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  noProfileText: { fontSize: 16, fontFamily: 'Kanit-Regular', color: colors.textSecondary, textAlign: 'center' },
  summaryContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  summaryTitle: { fontSize: 18, fontFamily: 'Kanit-Bold', color: colors.textPrimary, marginBottom: 16 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progressBar: { flex: 1, height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden', marginRight: 10 },
  progressFill: { height: '100%' },
  progressText: { fontSize: 14, fontFamily: 'Kanit-Bold', width: 40, textAlign: 'right' },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 17,
    fontFamily: 'Kanit-Regular',
    marginLeft: 8,
  },
  sodiumInfoContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  sodiumInfoItem: { flex: 1, alignItems: 'center' },
  sodiumInfoDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 10 },
  sodiumLabel: { fontSize: 14, fontFamily: 'Kanit-Regular', color: colors.textSecondary, marginBottom: 4 },
  sodiumValue: { fontSize: 16, fontFamily: 'Kanit-Bold', color: colors.textPrimary },
  periodSelectorContainer: {
    flexDirection: 'row', marginBottom: 16, backgroundColor: colors.white,
    borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  periodButton: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.white },
  activePeriodButton: { backgroundColor: colors.primary },
  periodButtonText: { fontSize: 14, fontFamily: 'Kanit-Regular', color: colors.textPrimary },
  activePeriodButtonText: { color: colors.white, fontFamily: 'Kanit-Bold' },
  chart: { marginVertical: 8, borderRadius: 8 },
  emptyChartContainer: { height: 220, justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { fontSize: 16, fontFamily: 'Kanit-Regular', color: colors.textSecondary, textAlign: 'center' },
  averageContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  averageValue: {
    fontSize: 14,
    fontFamily: 'Kanit-Bold',
    color: colors.textPrimary,
  },
  recommendedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  recommendedLine: {
    width: 20,
    height: 2,
    backgroundColor: 'red',
    marginRight: 8,
  },
  recommendedLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
});