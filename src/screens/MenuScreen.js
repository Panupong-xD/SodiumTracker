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
  getProfileData 
} from '../utils/storage';
import initialFoods from '../data/initialFoods';
import colors from '../constants/colors';

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
        // Load food items
        const savedFoodItems = await getFoodItems();
        if (savedFoodItems && savedFoodItems.length > 0) {
          setFoodItems(savedFoodItems);
          setFilteredItems(savedFoodItems);
        } else {
          // If no saved food items, use initial data
          setFoodItems(initialFoods);
          setFilteredItems(initialFoods);
          
          // Save initial food items
          await saveFoodItems(initialFoods);
        }
        
        // Load profile data
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(foodItems);
    } else {
      const filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, foodItems]);

  const handleAddFood = async (newFood) => {
    try {
      const profile = await getProfileData();
      if (!profile || !profile.name) {
        Alert.alert('ต้องตั้งค่าโปรไฟล์ก่อน', 'กรุณาตั้งค่าโปรไฟล์ของคุณที่หน้าโปรไฟล์ก่อนบันทึกเมนูอาหาร');
        return;
      }
  
      const updatedFoodItems = [...foodItems, { ...newFood, id: Date.now().toString() }];
      setFoodItems(updatedFoodItems);
      await saveFoodItems(updatedFoodItems);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มรายการอาหารได้');
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
      console.error('Error recording consumption:', error);
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FoodItem 
                food={item} 
                onConsume={() => handleConsume(item)} 
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyText}>ไม่พบรายการอาหาร</Text>
              </View>
            }
            contentContainerStyle={filteredItems.length === 0 ? { flex: 1 } : null}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
          >
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
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default MenuScreen;
