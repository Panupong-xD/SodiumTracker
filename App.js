import 'react-native-gesture-handler'; // <<<< ต้องใส่บรรทัดแรก
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context'; //จัดการแถบด้านบน
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar'; //ปรับสีตรงแถบแบตเตอรี่ให้เข้ากับแอพ
import * as Font from 'expo-font';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { initializeStorage } from './src/utils/storage';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      //เช็กว่า key สำหรับประวัติการบริโภคมีอยู่ใน AsyncStorage หรือยัง ถ้ามีอยู่แล้วก็ไม่ทำอะไรเลยครับ แต่ถ้าไม่มีมันจะสร้างค่าเริ่มต้นให้เป็น array ว่างเพื่อป้องกัน error เวลาหน้าอื่นเรียกใช้งาน
      await initializeStorage();
      await Font.loadAsync({
        'Kanit-Regular': require('./assets/fonts/Kanit-Regular.ttf'),
        'Kanit-Bold': require('./assets/fonts/Kanit-Bold.ttf'),
      });
      setIsReady(true);
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C6170" />
        <Text style={styles.loadingText}>กำลังโหลดแอป...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Kanit-Regular' },
});
