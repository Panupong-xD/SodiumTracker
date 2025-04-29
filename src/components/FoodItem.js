import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatSodiumAmount } from '../utils/sodiumCalculator';
import colors from '../constants/colors';

const FoodItem = ({ food, onConsume, onDelete }) => {
  // Mapping ชื่อไฟล์รูปภาพเป็นผลลัพธ์ของ require
  const imageMap = {
    'food1.jpg': require('../../assets/images/food1.jpg'),
    'food2.jpg': require('../../assets/images/food2.jpg'),
  };

  // ถ้า food.image เป็น URI (จากผู้ใช้เลือก) ให้ใช้ URI โดยตรง
  // ถ้า food.image เป็นชื่อไฟล์ (จาก initialFoods) ให้ใช้ imageMap
  let imageSource;
  if (food.image && food.image.startsWith('file://')) {
    imageSource = { uri: food.image };
  } else {
    imageSource = food.image && imageMap[food.image] ? imageMap[food.image] : imageMap['food1.jpg'];
  }

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.foodImage} />

      <Text style={styles.foodName}>{food.name}</Text>
      <Text style={styles.sodiumText}>{formatSodiumAmount(food.sodium)}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.consumeButton} onPress={onConsume}>
          <Text style={styles.consumeButtonText}>บันทึก</Text>
          <Ionicons name="add-circle-outline" size={16} color={colors.white} />
        </TouchableOpacity>

        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sodiumText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  consumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  consumeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
});

export default FoodItem;