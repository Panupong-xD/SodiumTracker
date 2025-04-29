// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY              = '@kidney_tracker:profile';
const FOOD_ITEMS_KEY           = '@kidney_tracker:food_items';
const CONSUMPTION_HISTORY_KEY  = '@kidney_tracker:consumption_history';
/**
 * Initialize storage with default values if not set
 */
export const initializeStorage = async () => {
  try {
    // Check if food items exist
    const foodItems = await AsyncStorage.getItem(FOOD_ITEMS_KEY);
    
    // If no food items, we'll create them on first MenuScreen load
    
    // Initialize empty consumption history if it doesn't exist
    const consumptionHistory = await AsyncStorage.getItem(CONSUMPTION_HISTORY_KEY);
    if (!consumptionHistory) {
      await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

/**
 * Save profile data
 */
export const saveProfileData = async (profileData) => {
  try {
    const jsonValue = JSON.stringify(profileData);
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving profile data:', error);
    throw error;
  }
};

/**
 * Get profile data
 */
export const getProfileData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    throw error;
  }
};

/**
 * Save food items
 */
export const saveFoodItems = async (foodItems) => {
  try {
    const jsonValue = JSON.stringify(foodItems);
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving food items:', error);
    throw error;
  }
};

/**
 * Get food items
 */
export const getFoodItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(FOOD_ITEMS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting food items:', error);
    throw error;
  }
};

/**
 * Add a food consumption record
 */
export const addConsumption = async (consumptionData) => {
  try {
    const existingData = await getConsumptionHistory() || [];
    const updatedData = [...existingData, consumptionData];
    
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error adding consumption record:', error);
    throw error;
  }
};

/**
 * Get consumption history
 */
export const getConsumptionHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CONSUMPTION_HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting consumption history:', error);
    throw error;
  }
};

/**
 * Clear all consumption history
 */
export const clearConsumptionHistory = async () => {
  try {
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing consumption history:', error);
    throw error;
  }
};

export const removeConsumptionById = async (id) => {
  try {
    const existing = await getConsumptionHistory();
    const updated  = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(
      CONSUMPTION_HISTORY_KEY,
      JSON.stringify(updated)
    );
  } catch (err) {
    console.error('Error removing consumption record:', err);
    throw err;
  }
};
