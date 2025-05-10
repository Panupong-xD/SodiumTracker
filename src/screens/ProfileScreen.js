// src/screens/ProfileScreen.js (updated)
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfileData, saveProfileData } from "../utils/storage";
import { calculateRecommendedSodium } from "../utils/sodiumCalculator";
import colors from "../constants/colors";

const ProfileScreen = () => {
  /* ชื่อถูกถอดออกตามคำขอ  */
  const [profile, setProfile] = useState({
    age: "",
    weight: "",
    height: "",
    kidneyStage: "1",
    gender: "male",
  });

  const [recommendedSodium, setRecommendedSodium] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  /* โหลดโปรไฟล์ที่บันทึกไว้ */
  useEffect(() => {
    const loadProfile = async () => {
      const saved = await getProfileData();
      if (saved) {
        /* กรองชื่อออกหากเคยมีเก็บไว้ */
        const { name, ...rest } = saved;
        setProfile(rest);
        const sodium = calculateRecommendedSodium(rest);
        setRecommendedSodium(sodium);
        setFormSubmitted(true);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const validateForm = () => {
    /* ตรวจเฉพาะฟิลด์ที่จำเป็น  */
    if (
      !profile.age ||
      isNaN(profile.age) ||
      parseInt(profile.age) <= 0 ||
      parseInt(profile.age) > 120
    ) {
      Alert.alert("กรุณาระบุอายุที่ถูกต้อง (1-120 ปี)");
      return false;
    }

    if (
      !profile.weight ||
      isNaN(profile.weight) ||
      parseFloat(profile.weight) <= 0 ||
      parseFloat(profile.weight) > 300
    ) {
      Alert.alert("กรุณาระบุน้ำหนักที่ถูกต้อง (1-300 กก.)");
      return false;
    }

    if (
      !profile.height ||
      isNaN(profile.height) ||
      parseInt(profile.height) <= 0 ||
      parseInt(profile.height) > 250
    ) {
      Alert.alert("กรุณาระบุส่วนสูงที่ถูกต้อง (1-250 ซม.)");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const sodium = calculateRecommendedSodium(profile);
      const updatedProfile = { ...profile, recommendedSodium: sodium };
      await saveProfileData(updatedProfile);
      setRecommendedSodium(sodium);
      setFormSubmitted(true);
      Alert.alert("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const renderResult = () => {
    if (!formSubmitted || !recommendedSodium) return null;
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeader}>ปริมาณโซเดียมที่แนะนำต่อวัน</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{recommendedSodium}</Text>
          <Text style={styles.resultUnit}>มิลลิกรัม</Text>
        </View>
        <Text style={styles.resultDescription}>
          ปริมาณโซเดียมที่แนะนำสำหรับคุณตามระยะโรคไตที่ {profile.kidneyStage}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidContainer}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>ข้อมูลส่วนตัว</Text>
            <Text style={styles.subheader}>
              กรอกข้อมูลของคุณเพื่อคำนวณปริมาณโซเดียมที่แนะนำต่อวัน
            </Text>
          </View>

          <View style={styles.form}>
            {/* อายุ + เพศ */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>อายุ (ปี)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.age}
                  onChangeText={(v) => handleInputChange("age", v)}
                  keyboardType="numeric"
                  placeholder="อายุ"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>เพศ</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.gender}
                    onValueChange={(v) => handleInputChange("gender", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="ชาย" value="male" />
                    <Picker.Item label="หญิง" value="female" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* น้ำหนัก + ส่วนสูง */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>น้ำหนัก (กก.)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.weight}
                  onChangeText={(v) => handleInputChange("weight", v)}
                  keyboardType="numeric"
                  placeholder="น้ำหนัก"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>ส่วนสูง (ซม.)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.height}
                  onChangeText={(v) => handleInputChange("height", v)}
                  keyboardType="numeric"
                  placeholder="ส่วนสูง"
                />
              </View>
            </View>

            {/* ระยะ CKD */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ระยะของโรคไต</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.kidneyStage}
                  onValueChange={(v) => handleInputChange("kidneyStage", v)}
                  style={styles.picker}
                >
                  <Picker.Item label="ระยะที่ 1" value="1" />
                  <Picker.Item label="ระยะที่ 2" value="2" />
                  <Picker.Item label="ระยะที่ 3a" value="3a" />
                  <Picker.Item label="ระยะที่ 3b" value="3b" />
                  <Picker.Item label="ระยะที่ 4" value="4" />
                  <Picker.Item label="ระยะที่ 5" value="5" />
                  <Picker.Item label="ระยะที่ 5 (ล้างไต)" value="5D" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>บันทึกข้อมูล</Text>
            </TouchableOpacity>
          </View>

          {renderResult()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidContainer: { flex: 1 },
  scrollView: { flex: 1, padding: 16 },
  headerContainer: { marginBottom: 24 },
  header: { fontSize: 24, fontFamily: "Kanit-Bold", color: colors.textPrimary, marginBottom: 8 },
  subheader: { fontSize: 16, fontFamily: "Kanit-Regular", color: colors.textSecondary },
  form: { backgroundColor: colors.white, borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  halfWidth: { width: "48%" },
  label: { marginBottom: 8, fontSize: 16, fontFamily: "Kanit-Regular", color: colors.textPrimary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, fontFamily: "Kanit-Regular", color: colors.textPrimary },
  pickerContainer: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: "hidden" },
  picker: { height: 50 },
  submitButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: "center", marginTop: 8 },
  submitButtonText: { color: colors.white, fontSize: 16, fontFamily: "Kanit-Bold" },
  resultContainer: { backgroundColor: colors.white, borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 20 },
  resultHeader: { fontSize: 18, fontFamily: "Kanit-Bold", color: colors.textPrimary, marginBottom: 16 },
  resultBox: { backgroundColor: colors.primaryLight, borderRadius: 8, padding: 16, width: "100%", alignItems: "center", marginBottom: 16 },
  resultValue: { fontSize: 32, fontFamily: "Kanit-Bold", color: colors.primary },
  resultUnit: { fontSize: 16, fontFamily: "Kanit-Regular", color: colors.primary, marginTop: 4 },
  resultDescription: { fontSize: 14, fontFamily: "Kanit-Regular", color: colors.textSecondary, textAlign: "center" },
});

export default ProfileScreen;
