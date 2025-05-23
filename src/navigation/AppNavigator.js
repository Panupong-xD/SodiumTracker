import { NavigationContainer } from '@react-navigation/native'; //ใช้ครอบตัวแอป เพื่อเปิดใช้งานระบบนำทาง (navigation)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; //ใช้สร้างเมนูแถบล่าง (Tab bar)
import { Ionicons } from '@expo/vector-icons'; //ใช้แสดงไอคอนในแถบเมนู เช่น ไอคอนคน, ประวัติ
import { StyleSheet } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'โปรไฟล์') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'เมนูอาหาร') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'แดชบอร์ด') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'ประวัติ') {
              iconName = focused ? 'time' : 'time-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
        })}
      >
        <Tab.Screen
          name="โปรไฟล์" 
          component={ProfileScreen} 
          options={{
            title: "โปรไฟล์ผู้ใช้"
          }}
        />
        <Tab.Screen 
          name="เมนูอาหาร" 
          component={MenuScreen} 
          options={{
            title: "เมนูอาหาร"
          }}
        />
        <Tab.Screen 
          name="แดชบอร์ด" 
          component={DashboardScreen} 
          options={{
            title: "แดชบอร์ด"
          }}
        />
        <Tab.Screen 
          name="ประวัติ" 
          component={HistoryScreen} 
          options={{
            title: "ประวัติการบริโภค"
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBarLabel: {
    fontFamily: 'Kanit-Regular',
    fontSize: 12,
  },
  header: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontFamily: 'Kanit-Bold',
    fontSize: 18,
    color: colors.textPrimary,
  },
});
