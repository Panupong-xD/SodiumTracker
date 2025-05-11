// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY              = '@kidney_tracker:profile';
const FOOD_ITEMS_KEY           = '@kidney_tracker:food_items';
const CONSUMPTION_HISTORY_KEY  = '@kidney_tracker:consumption_history';

//initializeStorage – ตั้งค่าข้อมูลเริ่มต้น ถ้ายังไม่มี
export const initializeStorage = async () => { // สร้างฟังก์ชันแบบ async ชื่อ initializeStorage
  try { // เริ่มบล็อกดักจับข้อผิดพลาด
    const consumptionHistory = await AsyncStorage.getItem(CONSUMPTION_HISTORY_KEY); // อ่านข้อมูล consumption history จาก storage

    if (!consumptionHistory) { // ถ้าไม่มีข้อมูล (เป็น null หรือ undefined)
      await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([])); // เซ็ตข้อมูลเริ่มต้นให้เป็น array ว่าง []
    }
  } catch (error) { // ถ้ามีข้อผิดพลาด
    console.error('Error initializing storage:', error); // แสดง error ใน console
    throw error; // โยน error กลับไปยังผู้เรียก
  }
};


//saveProfileData – บันทึกข้อมูลโปรไฟล์ผู้ใช้
export const saveProfileData = async (profileData) => { // ฟังก์ชันบันทึกข้อมูลโปรไฟล์ รับ profileData เป็นพารามิเตอร์
  try {
    const jsonValue = JSON.stringify(profileData); // แปลง profileData เป็นข้อความ JSON
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue); // เซฟข้อมูลไปยังคีย์ PROFILE_KEY
  } catch (error) {
    console.error('Error saving profile data:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};


// getProfileData – ดึงข้อมูลโปรไฟล์ผู้ใช้
export const getProfileData = async () => { // ฟังก์ชันดึงข้อมูลโปรไฟล์
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY); // อ่านข้อมูลจาก PROFILE_KEY
    return jsonValue != null ? JSON.parse(jsonValue) : null; // ถ้ามีข้อมูลแปลงเป็น object แล้วส่งคืน ถ้าไม่มีส่งคืน null
  } catch (error) {
    console.error('Error getting profile data:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};


//saveFoodItems – บันทึกรายการอาหาร
export const saveFoodItems = async (foodItems) => { // ฟังก์ชันบันทึกรายการอาหาร รับ foodItems เป็นพารามิเตอร์
  try {
    const jsonValue = JSON.stringify(foodItems); // แปลงรายการอาหารเป็น JSON
    await AsyncStorage.setItem(FOOD_ITEMS_KEY, jsonValue); // เซฟลงคีย์ FOOD_ITEMS_KEY
  } catch (error) {
    console.error('Error saving food items:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};


//getFoodItems – ดึงรายการอาหาร
export const getFoodItems = async () => { // ฟังก์ชันดึงรายการอาหาร
  try {
    const jsonValue = await AsyncStorage.getItem(FOOD_ITEMS_KEY); // อ่านข้อมูลจาก FOOD_ITEMS_KEY
    return jsonValue != null ? JSON.parse(jsonValue) : null; // ถ้ามีข้อมูลแปลงเป็น array แล้วส่งคืน ถ้าไม่มีส่งคืน null
  } catch (error) {
    console.error('Error getting food items:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
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
export const clearConsumptionHistory = async () => { // ฟังก์ชันล้างประวัติการบริโภค
  try {
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify([])); // เซฟ array ว่างแทนข้อมูลเดิม
  } catch (error) {
    console.error('Error clearing consumption history:', error); // แจ้งข้อผิดพลาด
    throw error; // โยน error กลับ
  }
};

//removeConsumptionById – ลบรายการประวัติการบริโภคเฉพาะชิ้น
export const removeConsumptionById = async (id) => { // ฟังก์ชันลบประวัติการบริโภคเฉพาะชิ้น รับ id เป็นพารามิเตอร์
  try {
    const existing = await getConsumptionHistory(); // โหลดประวัติการบริโภค
    const updated  = existing.filter(item => item.id !== id); // กรองเอารายการที่ id ไม่ตรงกับที่ส่งมา
    await AsyncStorage.setItem(CONSUMPTION_HISTORY_KEY, JSON.stringify(updated)); // เซฟรายการใหม่ที่ถูกลบแล้ว
  } catch (err) {
    console.error('Error removing consumption record:', err); // แจ้งข้อผิดพลาด
    throw err; // โยน error กลับ
  }
};

