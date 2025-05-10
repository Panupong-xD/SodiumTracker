import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatSodiumAmount } from '../utils/sodiumCalculator';
import colors from '../constants/colors';

const FoodItem = ({ food, onConsume, onDelete, onToggleFavorite }) => {
  const imageMap = {
    'defaultFood.png': require('../../assets/images/defaultFood.png')
  };

  // ถ้า food.image เป็น URI (จากผู้ใช้เลือก) ให้ใช้ URI โดยตรง
  let imageSource;
  if (food.image && food.image.startsWith('file://')) {
    imageSource = { uri: food.image };
  } else {
    imageSource =
  food.image && imageMap[food.image]
    ? imageMap[food.image]
    : imageMap['defaultFood.png'];
  }

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.foodImage} />

      <Text style={styles.foodName}>{food.name}</Text>

      <Text style={styles.sodiumText}>{formatSodiumAmount(food.sodium)}</Text>

      <View style={styles.buttonContainer}>
        {/* บรรทัดแรก: ปุ่มดาวและปุ่มถังขยะ */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={onToggleFavorite}
            style={[styles.favoriteButton, !onDelete && styles.fullWidthButton]}
          >
            <Ionicons
              name={food.isFavorite ? 'star' : 'star-outline'}
              size={16}
              color={food.isFavorite ? '#FFD700' : colors.textSecondary}
            />
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* บรรทัดที่สอง: ปุ่มบันทึก */}
        <TouchableOpacity style={styles.consumeButton} onPress={onConsume}>
          <Text style={styles.consumeButtonText}>บันทึก</Text>
          <Ionicons name="add-circle-outline" size={16} color={colors.white} />
        </TouchableOpacity>
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
    marginBottom: 4,
  },
  sodiumText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 0,
    width: '100%',
  },
  consumeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: '100%',
  },
  consumeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    marginRight: 4,
  },
});

export default FoodItem;