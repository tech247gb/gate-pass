import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Button,
  IconButton,
  MD3Colors,
  Divider,
  Text,
  TextInput,
} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFormFields,
  updateVehicleInfo,
  getVehicleById,
} from '../services/database';
import styles from '../styles/StyleSheet';
const AddVehicleDetails = props => {
  const {navigation} = props;
  const isFocused = useIsFocused();
  const [editFormData, setEditFormData] = useState([]);
  const [editFormValues, setEditFormValues] = useState([]);
  const [uniqueField, setUniqueField] = useState();
  useEffect(async () => {
    if (typeof uniqueField != 'undefined') {
      getFormFieldData(id);
    }
  }, [isFocused, uniqueField]);

  const handleFormChange = (index, text) => {
    setEditFormValues({
      ...editFormValues,
      [index]: index != `${uniqueField}` ? text : text.replace(/ /g, ''),
    });
  };

  const notifyMessage = (msg, title, type) => {
    Toast.show({
      type: type,
      text1: title,
      text2: msg,
      position: 'bottom',
    });
  };
  const saveVehicleInfo = async () => {
    const updateTable = await updateVehicleInfo(editFormValues, uniqueField);
    if (updateTable) {
      notifyMessage('Vehicle info added successfully', 'Completed', 'success');
      setEditFormData([]);
      setEditFormValues([]);
    }
  };
  const hideEditModal = () => {
    navigation.goBack();
  };
  const id = props?.route?.params?.vehicleId;
  useEffect(async () => {
    const uniqueId = await AsyncStorage.getItem('uniqueField');
    if (uniqueId) {
      setUniqueField(uniqueId);
    }
  }, [isFocused]);

  const getFormFieldData = async id => {
    const formData = await getFormFields();
    setEditFormData(formData);
    if (id > 0) {
      const formValues = await getVehicleById(id);
      setEditFormValues(formValues);
    } else {
      const obj = {};
      for (let data of Object.keys(formData)) {
        obj[data] = '';
      }
      obj.id = 0;
      obj.is_pass_allocated = 0;
      obj.pass_issued_on = '';
      obj[`${uniqueField}`] = obj[`${uniqueField}`].replace(/ /g, '');
      setEditFormValues(obj);
    }
  };
  const navigationWhenEdit = (vehicleNumber) =>{
    navigation.navigate('Main', {
      screen: 'SearchVehicle',
      params: {
        vehicleNumber:vehicleNumber,
        backUrl: 'edit',
      },
    });
  };
  const navigationWhenAdd = () =>{
    navigation.navigate('Main', {
      screen: 'HomeScreen',
      params: {backUrl: 'add'},
    });
  }
  return (
    <View style={styles.fullScreenModalStyle}>
      <View style={styles.fullScreenView}>
        <IconButton
          icon="arrow-left"
          iconColor={MD3Colors.neutral20}
          size={25}
          onPress={() => hideEditModal()}
          style={styles.backIcon}
        />
        {editFormValues.id > 0 ? (
          <Text style={styles.searchVehicleHeader}>Edit Vehicle Info</Text>
        ) : (
          <Text style={styles.searchVehicleHeader}>Register Vehicle</Text>
        )}
        <Text></Text>
      </View>
      <ScrollView>
        <View style={styles.mainView3}>
          <View style={styles.addVehicleView}>
            {editFormData &&
              Object.keys(editFormData).map((detail, id) => {
                return (
                  <View key={id}>
                    <Text style={styles.qLabel}>{editFormData[detail]}</Text>
                    {/* <Text style={styles.qValue}>{userData[detail]}</Text> */}
                    <TextInput
                      value={editFormValues[detail]}
                      mode="outlined"
                      onChangeText={text => handleFormChange(detail, text)}
                    />
                    <Divider style={styles.devider} />
                  </View>
                );
              })}
            <Button
              style={styles.buttonRevert}
              icon="account-check-outline"
              mode="elevated"
              buttonColor={MD3Colors.primary40}
              textColor={MD3Colors.neutral100}
              onPress={() => {
                saveVehicleInfo();
                if (id != null) {
                  navigationWhenEdit(editFormValues[uniqueField])
                } else {
                  navigationWhenAdd()
                }
              }}>
              Submit
            </Button>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};
export default AddVehicleDetails;
