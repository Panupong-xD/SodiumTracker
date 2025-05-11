import 'react-native-gesture-handler'; // <<<< ต้องใส่บรรทัดแรก
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { initializeStorage } from './src/utils/storage';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
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
