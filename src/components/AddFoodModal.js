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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const AddFoodModal = ({ visible, onClose, onAddFood }) => {
  const [foodName, setFoodName] = useState('');
  const [sodiumAmount, setSodiumAmount] = useState('');
  const [category, setCategory] = useState('อาหารจานเดียว');

  const categories = [
    'อาหารจานเดียว',
    'อาหารไทย',
    'อาหารว่าง',
    'อาหารสำเร็จรูป',
    'ฟาสต์ฟู้ด',
    'เครื่องดื่ม',
    'ซุป',
    'โปรตีน',
    'ผัก',
    'เครื่องเคียง',
    'อื่นๆ',
  ];

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

    // Create new food item
    const newFood = {
      name: foodName.trim(),
      sodium: Number(sodiumAmount),
      category,
    };

    // Pass to parent component
    onAddFood(newFood);

    // Reset form
    setFoodName('');
    setSodiumAmount('');
    setCategory('อาหารจานเดียว');
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
                  <Text style={styles.label}>หมวดหมู่</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={category}
                      onValueChange={(value) => setCategory(value)}
                      style={styles.picker}
                    >
                      {categories.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                      ))}
                    </Picker>
                  </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
