import React, { useState, useEffect } from 'react';
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
import { getConsumptionHistory, getProfileData } from '../utils/storage';
import ChartContainer from '../components/ChartContainer';
import colors from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const [period, setPeriod] = useState('weekly'); // weekly, monthly, yearly
  const [consumptionData, setConsumptionData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [dailyData, setDailyData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const history = await getConsumptionHistory();
        const profileData = await getProfileData();
        
        setConsumptionData(history || []);
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (consumptionData.length > 0) {
      processData();
    } else {
      setChartData({
        labels: [],
        datasets: [{ data: [] }]
      });
      setDailyData(null);
    }
  }, [consumptionData, period]);

  const processData = () => {
    // Sort consumption data by timestamp
    const sortedData = [...consumptionData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Group data by day
    const groupedByDay = sortedData.reduce((acc, item) => {
      const date = new Date(item.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalSodium: 0,
          items: []
        };
      }
      
      acc[dateKey].totalSodium += parseInt(item.sodiumAmount);
      acc[dateKey].items.push(item);
      
      return acc;
    }, {});

    // Convert grouped data to array
    const dailyDataArray = Object.values(groupedByDay);
    setDailyData(dailyDataArray);

    // Prepare chart data based on selected period
    let labels = [];
    let dataPoints = [];

    if (period === 'weekly') {
      // Get last 7 days
      const last7Days = getLast7Days();
      
      labels = last7Days.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });
      
      dataPoints = last7Days.map(date => {
        const matchingDay = dailyDataArray.find(item => item.date === date);
        return matchingDay ? matchingDay.totalSodium : 0;
      });
    } 
    else if (period === 'monthly') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
      const monthData = [];
      labels.length = 0;
    
      for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
        const dayData = groupedByDay[dateKey];
    
        monthData.push(dayData ? dayData.totalSodium : 0);
    
        // ใส่ label เฉพาะวันที่หาร 5 ลงตัว (5,10,15,20,25,30)
        if (i % 5 === 0 || i === daysInMonth) {
          labels.push(i.toString());
        } else {
          labels.push(''); // วันที่ไม่หาร 5 ลงตัว ให้ label ว่าง
        }
      }
    
      dataPoints = monthData;
    }
     
    else if (period === 'yearly') {
      // Get data by month for current year
      const currentYear = new Date().getFullYear();
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      
      const yearData = Array(12).fill(0);
      
      dailyDataArray.forEach(item => {
        const itemDate = item.date.split('-');
        const itemYear = parseInt(itemDate[0]);
        const itemMonth = parseInt(itemDate[1]) - 1;
        
        if (itemYear === currentYear) {
          yearData[itemMonth] += item.totalSodium;
        }
      });
      
      labels = monthNames;
      dataPoints = yearData;
    }

    setChartData({
      labels: labels,
      datasets: [{ data: dataPoints }]
    });
  };

  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      result.push(`${year}-${month}-${day}`);
    }
    return result;
  };

  const getTodayConsumption = () => {
    if (!dailyData || dailyData.length === 0) return 0;
    
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    const todayData = dailyData.find(item => item.date === todayKey);
    return todayData ? todayData.totalSodium : 0;
  };

  const renderSummary = () => {
    if (!profile) {
      return (
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileText}>กรุณาตั้งค่าโปรไฟล์ของคุณที่หน้าโปรไฟล์</Text>
        </View>
      );
    }

    const recommendedSodium = parseInt(profile.recommendedSodium || 2000);
    const todayConsumption = getTodayConsumption();
    const percentage = Math.min(Math.round((todayConsumption / recommendedSodium) * 100), 100);
    
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>สรุปการบริโภคโซเดียมวันนี้</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: percentage > 90 ? colors.danger : colors.primary
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{percentage}%</Text>
        </View>
        
        <View style={styles.sodiumInfoContainer}>
          <View style={styles.sodiumInfoItem}>
            <Text style={styles.sodiumLabel}>ปริมาณที่บริโภค</Text>
            <Text style={styles.sodiumValue}>{todayConsumption} มก.</Text>
          </View>
          
          <View style={styles.sodiumInfoDivider} />
          
          <View style={styles.sodiumInfoItem}>
            <Text style={styles.sodiumLabel}>ปริมาณที่แนะนำ</Text>
            <Text style={styles.sodiumValue}>{recommendedSodium} มก.</Text>
          </View>
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
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === 'weekly' && styles.activePeriodButton,
                ]}
                onPress={() => setPeriod('weekly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === 'weekly' && styles.activePeriodButtonText,
                  ]}
                >
                  รายสัปดาห์
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === 'monthly' && styles.activePeriodButton,
                ]}
                onPress={() => setPeriod('monthly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === 'monthly' && styles.activePeriodButtonText,
                  ]}
                >
                  รายเดือน
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === 'yearly' && styles.activePeriodButton,
                ]}
                onPress={() => setPeriod('yearly')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === 'yearly' && styles.activePeriodButtonText,
                  ]}
                >
                  รายปี
                </Text>
              </TouchableOpacity>
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
                      color: (opacity = 1) => `rgba(12, 97, 112, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: colors.primary,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>
                      ไม่มีข้อมูลสำหรับแสดงในกราฟ
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  noProfileContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noProfileText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Kanit-Bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Kanit-Bold',
    width: 40,
    textAlign: 'right',
  },
  sodiumInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sodiumInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  sodiumInfoDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  sodiumLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sodiumValue: {
    fontSize: 16,
    fontFamily: 'Kanit-Bold',
    color: colors.textPrimary,
  },
  periodSelectorContainer: {
    flexDirection: 'row',
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
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textPrimary,
  },
  activePeriodButtonText: {
    color: colors.white,
    fontFamily: 'Kanit-Bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyChartContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
