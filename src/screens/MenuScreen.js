// src/screens/MenuScreen.js – add missing handleConsume to resolve runtime error
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
import colors from '../constants/colors';

import FoodItem from '../components/FoodItem';
import AddFoodModal from '../components/AddFoodModal';

import {
  getFoodItems,
  saveFoodItems,
  addConsumption,
  getProfileData,
} from '../utils/storage';

/* เมนูเริ่มต้นว่าง 100% */
const initialFoods = [];

const MenuScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  /* ---------------------------- LOAD DATA ---------------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFoodItems();
        if (saved && saved.length) {
          const merged = saved.map(it => ({ ...it, isFavorite: it.isFavorite ?? false }));
          setFoodItems(merged);
          setFilteredItems(sortItems(merged));
        } else {
          setFoodItems([]);
          setFilteredItems([]);
        }
        const profile = await getProfileData();
        setProfileData(profile);
      } catch (err) {
        console.error('Error loading food data:', err);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายการอาหารได้');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ------------------------- SEARCH & FILTER ------------------------- */
  const sortItems = items => {
    return [...items].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(sortItems(foodItems));
    } else {
      const filtered = foodItems.filter(it =>
        it.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredItems(sortItems(filtered));
    }
  }, [searchQuery, foodItems]);

  /* ------------------------------ HANDLERS ------------------------------ */
  const handleAddFood = async newFood => {
    try {
      const updated = [
        ...foodItems,
        { ...newFood, id: Date.now().toString(), isFavorite: false },
      ];
      setFoodItems(updated);
      setFilteredItems(sortItems(updated));
      await saveFoodItems(updated);
      setIsAddModalVisible(false);
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มรายการอาหารได้');
    }
  };

  const handleClearFoods = () => {
    Alert.alert('ยืนยันลบเมนู', 'คุณต้องการลบรายการอาหารทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            await saveFoodItems([]);
            setFoodItems([]);
            setFilteredItems([]);
            Alert.alert('สำเร็จ', 'ลบเมนูทั้งหมดเรียบร้อยแล้ว');
          } catch (err) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบเมนูได้');
          }
        },
      },
    ]);
  };

  const handleDeleteFood = async id => {
    Alert.alert('ยืนยันการลบ', 'คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = foodItems.filter(it => it.id !== id);
            setFoodItems(updated);
            setFilteredItems(sortItems(updated));
            await saveFoodItems(updated);
          } catch (err) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบเมนูได้');
          }
        },
      },
    ]);
  };

  const handleToggleFavorite = async id => {
    try {
      const updated = foodItems.map(it =>
        it.id === id ? { ...it, isFavorite: !it.isFavorite } : it,
      );
      setFoodItems(updated);
      setFilteredItems(sortItems(updated));
      await saveFoodItems(updated);
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะรายการโปรดได้');
    }
  };

  /* 👉 **เพิ่ม handler ที่หายไป** เพื่อแก้ Uncaught Error */
  const handleConsume = async food => {
    if (!profileData) {
      Alert.alert('ต้องตั้งค่าโปรไฟล์ก่อน', 'กรุณาตั้งค่าโปรไฟล์ของคุณที่หน้าโปรไฟล์ก่อนบันทึกการบริโภค');
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
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการบริโภคได้');
    }
  };

  /* ------------------------------- RENDER ------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.clearBtn} onPress={handleClearFoods}>
        <Ionicons name="trash-outline" size={24} color={colors.primary} />
      </TouchableOpacity>

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
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FoodItem
                food={item}
                onConsume={() => handleConsume(item)}
                onDelete={item.isCustom ? () => handleDeleteFood(item.id) : null}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
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
    flexDirection: "row",
    alignItems: "center",
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
    fontFamily: "Kanit-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: colors.textSecondary,
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  clearBtn: {
  position: 'absolute',
  top: 16,
  right: 16,
  padding: 4,
  backgroundColor: colors.white,
  borderRadius: 20,
  zIndex: 2,
},
});

export default MenuScreen;
