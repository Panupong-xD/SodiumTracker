// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY              = '@kidney_tracker:profile';
const FOOD_ITEMS_KEY           = '@kidney_tracker:food_items';
const CONSUMPTION_HISTORY_KEY  = '@kidney_tracker:consumption_history';

//initializeStorage – ตั้งค่าข้อมูลเริ่มต้น ถ้ายังไม่มี
export const initializeStorage = async () => {
  try {
    const consumptionHistory = await AsyncStorage.getItem(CONSUMPTION_HISTORY_KEY);

    if (!consumptionHistory) {
      await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([])); 
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};


// saveProfileData – บันทึกข้อมูลโปรไฟล์ผู้ใช้
export const saveProfileData = async (profileData) => {
  try {
    const jsonValue = JSON.stringify(profileData);
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving profile data:', error);
    throw error;
  }
};

// getProfileData – ดึงข้อมูลโปรไฟล์ผู้ใช้
export const getProfileData = async () => { 
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    throw error;
  }
};

// saveFoodItems – บันทึกรายการอาหาร
export const saveFoodItems = async (foodItems) => { // ฟังก์ชันบันทึกรายการอาหาร รับ foodItems เป็นพารามิเตอร์
  try {
    const jsonValue = JSON.stringify(foodItems); // แปลง foodItems (JavaScript array) เป็น string ในรูปแบบ JSON
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, jsonValue); // เซฟ string นี้ลงในคีย์ FOOD_ITEMS_KEY
  } catch (error) {
    console.error('Error saving food items:', error);
    throw error;
  }
};

// getFoodItems – ดึงรายการอาหาร
export const getFoodItems = async () => { // ฟังก์ชันดึงรายการอาหาร
  try {
    const jsonValue = await AsyncStorage.getItem(FOOD_ITEMS_KEY); // อ่าน string จากคีย์ FOOD_ITEMS_KEY
    return jsonValue != null ? JSON.parse(jsonValue) : null; // ถ้ามี string → แปลงกลับเป็น array แล้วคืนค่า, ถ้าไม่มี → คืน null
  } catch (error) {
    console.error('Error getting food items:', error);
    throw error;
  }
};



//addConsumption – เพิ่มรายการประวัติการบริโภค
export const addConsumption = async (consumptionData) => { // ฟังก์ชันเพิ่มประวัติการบริโภค รับ consumptionData เป็นพารามิเตอร์
  try {
    const existingData = await getConsumptionHistory() || []; // โหลดข้อมูลเก่า หรือใช้ array ว่างถ้าไม่มี
    const updatedData = [...existingData, consumptionData]; // รวมข้อมูลเก่ากับรายการใหม่
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify(updatedData)); // เซฟข้อมูลใหม่กลับไป
  } catch (error) {
    console.error('Error adding consumption record:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};


//getConsumptionHistory – ดึงประวัติการบริโภคทั้งหมด
export const getConsumptionHistory = async () => { // ฟังก์ชันดึงประวัติการบริโภคทั้งหมด
  try {
    const jsonValue = await AsyncStorage.getItem(CONSUMPTION_HISTORY_KEY); // อ่านข้อมูลจาก CONSUMPTION_HISTORY_KEY
    return jsonValue != null ? JSON.parse(jsonValue) : []; // ถ้ามีข้อมูลแปลงเป็น array แล้วส่งคืน ถ้าไม่มีส่งคืน array ว่าง
  } catch (error) {
    console.error('Error getting consumption history:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};


//clearConsumptionHistory – ล้างประวัติการบริโภคทั้งหมด
export const clearConsumptionHistory = async () => { 
  try {
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing consumption history:', error);
    throw error; 
  }
};

//removeConsumptionById – ลบรายการประวัติการบริโภคเฉพาะชิ้น
export const removeConsumptionById = async (id) => {
  try {
    const existing = await getConsumptionHistory();
    const updated  = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error removing consumption record:', err);
    throw err;
  }
};

