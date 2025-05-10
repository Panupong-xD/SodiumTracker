import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodItem from '../components/FoodItem';
import AddFoodModal from '../components/AddFoodModal';
import {
  getFoodItems,
  saveFoodItems,
  addConsumption,
  getProfileData,
} from '../utils/storage';
import colors from '../constants/colors';

// โหลดข้อมูลจาก initialFoods.json
const initialFoods = require('../data/initialFoods.json').map(item => ({
  ...item,
  isCustom: false,
  isFavorite: false, // เพิ่มฟิลด์ isFavorite และตั้งค่าเริ่มต้นเป็น false
}));

const MenuScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedFoodItems = await getFoodItems();
        let updatedFoodItems = savedFoodItems;

        if (savedFoodItems && savedFoodItems.length > 0) {
          // ตรวจสอบและเพิ่ม image และ isFavorite ถ้าขาดหาย (สำหรับข้อมูลเก่า)
          updatedFoodItems = savedFoodItems.map(item => {
            const matchingInitialFood = initialFoods.find(initialItem => initialItem.id === item.id);
            return {
              ...item,
              image: item.image || (matchingInitialFood ? matchingInitialFood.image : 'food1.jpg'),
              isFavorite: item.isFavorite ?? false, // ถ้าไม่มี isFavorite ให้ตั้งค่าเป็น false
            };
          });
          setFoodItems(updatedFoodItems);
          setFilteredItems(sortItems(updatedFoodItems)); // เรียงลำดับหลังโหลด
        } else {
          setFoodItems(initialFoods);
          setFilteredItems(sortItems(initialFoods));
          await saveFoodItems(initialFoods);
        }

        const profile = await getProfileData();
        setProfileData(profile);
      } catch (error) {
        console.error('Error loading food data:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายการอาหารได้');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ฟังก์ชันสำหรับเรียงลำดับ: เมนูที่ติดดาวอยู่ด้านบน
  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1; // a ติดดาว, b ไม่ติดดาว -> a อยู่บน
      if (!a.isFavorite && b.isFavorite) return 1;  // a ไม่ติดดาว, b ติดดาว -> b อยู่บน
      return 0; // ถ้าสถานะเท่ากัน ให้คงลำดับเดิม
    });
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(sortItems(foodItems));
    } else {
      const filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(sortItems(filtered));
    }
  }, [searchQuery, foodItems]);

  const handleAddFood = async (newFood) => {
    try {
      const updatedFoodItems = [...foodItems, { ...newFood, id: Date.now().toString(), isFavorite: false }];
      setFoodItems(updatedFoodItems);
      setFilteredItems(sortItems(updatedFoodItems));
      await saveFoodItems(updatedFoodItems);
      setIsAddModalVisible(false);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มรายการอาหารได้');
    }
  };

  const handleDeleteFood = async (foodId) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFoodItems = foodItems.filter(item => item.id !== foodId);
              setFoodItems(updatedFoodItems);
              setFilteredItems(sortItems(updatedFoodItems));
              await saveFoodItems(updatedFoodItems);
              Alert.alert('สำเร็จ', 'ลบเมนูเรียบร้อยแล้ว');
            } catch (error) {
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบเมนูได้');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (foodId) => {
    try {
      const updatedFoodItems = foodItems.map(item => {
        if (item.id === foodId) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
      setFoodItems(updatedFoodItems);
      setFilteredItems(sortItems(updatedFoodItems));
      await saveFoodItems(updatedFoodItems);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะรายการโปรดได้');
    }
  };

  const handleConsume = async (food) => {
    if (!profileData) {
      Alert.alert(
        'ต้องตั้งค่าโปรไฟล์ก่อน',
        'กรุณาตั้งค่าโปรไฟล์ของคุณที่หน้าโปรไฟล์ก่อนบันทึกการบริโภค',
        [{ text: 'เข้าใจแล้ว' }]
      );
      return;
    }

    try {
      const consumption = {
        id: Date.now().toString(),
        foodId: food.id,
        foodName: food.name,
        sodiumAmount: food.sodium,
        timestamp: new Date().toISOString(),
      };

      await addConsumption(consumption);
      Alert.alert('บันทึกสำเร็จ', `บันทึกการบริโภค "${food.name}" เรียบร้อยแล้ว`);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการบริโภคได้');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาอาหาร..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดรายการอาหาร...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredItems}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FoodItem
                food={item}
                onConsume={() => handleConsume(item)}
                onDelete={item.isCustom ? () => handleDeleteFood(item.id) : null}
                onToggleFavorite={() => handleToggleFavorite(item.id)} // เพิ่ม prop สำหรับติดดาว
              />
            )}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={{ paddingBottom: 80 }}
          />

          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>

          <AddFoodModal
            visible={isAddModalVisible}
            onClose={() => setIsAddModalVisible(false)}
            onAddFood={handleAddFood}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default MenuScreen;