import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const AddFoodModal = ({ visible, onClose, onAddFood }) => {
  const [foodName, setFoodName] = useState('');
  const [sodiumAmount, setSodiumAmount] = useState('');
  const [image, setImage] = useState(null); // เก็บ URI ของภาพที่เลือก

  // ฟังก์ชันสำหรับเลือกภาพจากแกลเลอรี่
  const pickImage = async () => {
    // ขออนุญาตเข้าถึงแกลเลอรี่
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('ต้องให้สิทธิ์', 'กรุณาให้สิทธิ์ในการเข้าถึงแกลเลอรี่เพื่อเลือกภาพ');
      return;
    }

    // เปิดแกลเลอรี่ให้ผู้ใช้เลือกภาพ
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // เก็บ URI ของภาพ
    }
  };

  // ฟังก์ชันสำหรับถ่ายภาพใหม่
  const takePhoto = async () => {
    // ขออนุญาตเข้าถึงกล้อง
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('ต้องให้สิทธิ์', 'กรุณาให้สิทธิ์ในการเข้าถึงกล้องเพื่อถ่ายภาพ');
      return;
    }

    // เปิดกล้องให้ผู้ใช้ถ่ายภาพ
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // เก็บ URI ของภาพ
    }
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!foodName.trim()) {
      Alert.alert('กรุณาระบุชื่ออาหาร');
      return;
    }

    if (!sodiumAmount || isNaN(Number(sodiumAmount)) || Number(sodiumAmount) <= 0) {
      Alert.alert('กรุณาระบุปริมาณโซเดียมที่ถูกต้อง');
      return;
    }

    if (!image) {
      Alert.alert('กรุณาเลือกภาพ');
      return;
    }

    // Create new food item
    const newFood = {
      name: foodName.trim(),
      sodium: Number(sodiumAmount),
      image, // ใช้ URI ของภาพที่เลือก
      isCustom: true, // เพิ่ม flag เพื่อระบุว่าเป็นเมนูที่ผู้ใช้เพิ่ม
    };

    // Pass to parent component
    onAddFood(newFood);

    // Reset form
    setFoodName('');
    setSodiumAmount('');
    setImage(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalView}>
              <View style={styles.header}>
                <Text style={styles.headerText}>เพิ่มอาหารใหม่</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>ชื่ออาหาร</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ระบุชื่ออาหาร"
                    value={foodName}
                    onChangeText={setFoodName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>ปริมาณโซเดียม (มิลลิกรัม)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ปริมาณโซเดียม"
                    value={sodiumAmount}
                    onChangeText={setSodiumAmount}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>เลือกภาพ</Text>
                  <View style={styles.imagePickerContainer}>
                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                      <Text style={styles.imageButtonText}>เลือกจากแกลเลอรี่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                      <Text style={styles.imageButtonText}>ถ่ายภาพ</Text>
                    </TouchableOpacity>
                  </View>
                  {image && (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.addButtonText}>เพิ่มอาหาร</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalView: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'Kanit-Bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  imageButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  imageButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Kanit-Bold',
  },
});

export default AddFoodModal;