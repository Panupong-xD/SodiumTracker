// ตารางค่าโซเดียมพื้นฐาน (มก.)
// -------------------------------
const BASE_SODIUM_BY_STAGE = {
  '1': 2300,
  '2': 2000,
  '3': 1800, // ครอบคลุม 3a, 3b ด้วย (ดูฟังก์ชัน mapStage)
  '3a': 1800,
  '3b': 1800,
  '4': 1700,
  '5': 1500, // ยังไม่ล้างไต
  '5D': 1800, // ล้างไต
};

// --------------------------
// ตัวคูณตามช่วงอายุ
// --------------------------
const getAgeMultiplier = (ageNum) => {
  if (ageNum < 18) return 0.8;
  if (ageNum <= 50) return 1.0;
  if (ageNum <= 70) return 0.9;
  return 0.8; // >70
};

// --------------------------
// ตัวคูณตามเพศ
// --------------------------
const getGenderMultiplier = (gender) => {
  return gender === 'female' ? 0.9 : 1.0; // ค่าเริ่มต้น male = 1.0
};

// --------------------------
// ตัวคูณตาม BMI
// --------------------------
const getBmiMultiplier = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 1.0; // fallback (ข้อมูลไม่ครบ)
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM ** 2);
  if (bmi < 18.5) return 1.0;
  if (bmi < 25) return 1.0;
  if (bmi < 30) return 1.05;
  return 1.1; // ≥ 30
};

// --------------------------
// Map stage 3a / 3b → 3
// --------------------------
const mapStage = (stage) => {
  if (stage === '3a' || stage === '3b') return '3';
  return stage;
};

// ================================================================
// ฟังก์ชันหลัก: คำนวณปริมาณโซเดียมที่แนะนำต่อวัน (มก.)
// ================================================================
export const calculateRecommendedSodium = (profile = {}) => {
  // รับค่าโปรไฟล์ (อายุ, เพศ, น้ำหนัก, ส่วนสูง, ระยะโรคไต)
  const {
    age = 0,
    gender = 'male',
    weight = 0,
    height = 0,
    kidneyStage = '1',
  } = profile;

  // 1) ค่าโซเดียมพื้นฐาน
  const stageKey = mapStage(kidneyStage);
  const baseSodium = BASE_SODIUM_BY_STAGE[stageKey] ?? 2000;

  // 2) ตัวคูณต่าง ๆ
  const ageMult = getAgeMultiplier(parseInt(age, 10));
  const genderMult = getGenderMultiplier(gender);
  const bmiMult = getBmiMultiplier(parseFloat(weight), parseFloat(height));

  // 3) คำนวณ
  const recommended = Math.round(baseSodium * ageMult * genderMult * bmiMult);
  return recommended;
};

// ================================================================
// Utilities เดิม (ไม่แก้ไข)
// ================================================================
export const formatSodiumAmount = (amount) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} กรัม`;
  }
  return `${amount} มก.`;
};

export const calculatePercentage = (amount, recommendedAmount) => {
  if (!recommendedAmount) return 0;
  const percentage = (amount / recommendedAmount) * 100;
  return Math.min(Math.round(percentage), 100);
};
