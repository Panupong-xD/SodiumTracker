import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatSodiumAmount } from '../utils/sodiumCalculator';
import colors from '../constants/colors';

const FoodItem = ({ food, onConsume }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.foodName}>{food.name}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.sodiumContainer}>
            <Ionicons name="salt-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.sodiumText}>{formatSodiumAmount(food.sodium)}</Text>
          </View>
          
          {food.category && (
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.categoryText}>{food.category}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.consumeButton}
        onPress={onConsume}
      >
        <Text style={styles.consumeButtonText}>บันทึก</Text>
        <Ionicons name="add-circle-outline" size={16} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 12,
  },
  contentContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sodiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  sodiumText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: colors.textSecondary,
  },
  consumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  consumeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    marginRight: 4,
  },
});

export default FoodItem;
