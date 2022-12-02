import React, {useState, useEffect} from 'react';
import {View, ImageBackground, Image, TouchableOpacity} from 'react-native';
import {
  Button,
  Portal,
  Provider,
  Dialog,
  Paragraph,
  IconButton,
  MD3Colors,
  Menu,
  Divider,
  FAB,
  Text,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import DocumentPicker from 'react-native-document-picker';
import Toast from 'react-native-toast-message';
import {readFile} from 'react-native-fs';
import Papa from 'papaparse';
import XLSX from 'xlsx';
import DropDown from 'react-native-paper-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  vehicleFromDatabase,
  deleteRecords,
  createFieldMappingTable,
  createTable,
  insertData,
  insertFieldMappingData,
  selectFieldMappingUniqueField,
} from '../services/database';
import styles from '../styles/StyleSheet';

const HomeScreen = props => {
  const [showDropDown, setShowDropDown] = useState(false);
  const {navigation} = props;
  const [showSetttings, setShowSetttings] = useState(true);
  const [visible, setVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [singleFile, setSingleFile] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reset, setReset] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [uploadFlag, setUploadFlag] = useState(false);
  const [resetCsvFlag, setResetcsvFlag] = useState('');
  const [hasError, setHasError] = useState(false);
  const [selectedUniqueColumn, setSelectedUniqueColumn] = useState();
  const [dataOnCsv, setDataOnCsv] = useState([]);
  const [tableFormat, setTableFormat] = useState({});
  const isFocused = useIsFocused();
  const [possibleColumnsForUniqueKey, setPossibleColumnsForUniqueKey] =
    useState([]);
  const [countOfUpload, setCountOfUpload] = useState(0);

  const notifyMessage = (msg, title, type) => {
    Toast.show({
      type: type,
      text1: title,
      text2: msg,
      position: 'bottom',
    });
  };
  useEffect(() => {
    const init = async () => {
      const dataCount = vehicleFromDatabase();
      setTotalCount(dataCount);
    };

    init().finally(async () => {
      SplashScreen.hide();
    });
  }, []);

  //Total Count LiveCheck
  useEffect(async () => {
    const newCount = await vehicleFromDatabase();
    setTotalCount(newCount.count);
  }, [isFocused, uploadFlag]);

  const hideImportModal = () => {
    setShowLoader(false);
    setModalVisible(false);
  };
  const deleteRecordsFromDataBase = async () => {
    setResetcsvFlag('completed');
    const deleteRecord = await deleteRecords();
    if (deleteRecord) {
      setCountOfUpload(0);
      AsyncStorage.removeItem('uniqueField');
      setSelectedUniqueColumn();
      setReset(false);
      setTotalCount(0);
      setPossibleColumnsForUniqueKey([]);
      setTableFormat({});
      setDataOnCsv([]);
      notifyMessage('Records Deleted Successfully', 'Completed', 'success');
    } else {
      notifyMessage('Something  went wrong', 'Error', 'error');
    }
  };
  const hideMenu = () => {
    setVisible(false);
  };
  const loadData = () => {
    hideMenu();
    setModalVisible(true);
  };

  const showMenu = () => {
    setVisible(true);
  };
  const confirmReset = () => {
    hideMenu();
    setReset(true);
  };

  /**
   *For selecting the file from device.
   *
   * Set tableFormat based on headers in csv
   * CSV headers are mapped into columns preseneted for filedMapping
   * Set Possible unique keys to a dropdown from csv header
   * Set available data to dataOnCsv for insertion to database
   */
  const selectOneFile = async () => {
    /**
     * Opening Document Picker for selection of one file
     * */
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const extension = res[0].name.substring(res[0].name.lastIndexOf('.') + 1);
      if (extension == 'csv') {
        setHasError(false);
        readFile(res[0].uri, 'ascii').then(res => {
          setShowLoader(true);
          Papa.parse(res, {
            header: true,
            skipEmptyLines: true,
            complete:  async (results)=> {
              let data = [];
              if (results && results['data'] && results['data'].length > 0) {
                const aa = XLSX.read(res, {type: 'binary'});
                const wsname = aa.SheetNames[0];
                const ws = aa.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, {header: 1});

                let result = [];
                const filteredColumns = data[0].filter(n => n);

                let tableFormat = {};
                for (let index = 0; index < filteredColumns.length; index++) {
                  const element = filteredColumns[index];
                  tableFormat['column' + index] = element;
                }
                for (let i = 1; i < data.length; i++) {
                  const values = data[i];
                  let obj = {};
                  for (const key in values) {
                    if (values[key]) {
                      obj['column' + key] = values[key].toString();
                    }
                  }
                  result.push(obj);
                }
                setShowLoader(false);
                let uniqueKey = {};
                let uniqueKeyArray = [];
                for (const key in tableFormat) {
                  uniqueKey['value'] = key;
                  uniqueKey['label'] = tableFormat[key];
                  uniqueKeyArray.push({...uniqueKey});
                }
                setPossibleColumnsForUniqueKey([...uniqueKeyArray]);
                setDataOnCsv([...result]);
                setTableFormat({...tableFormat});
              }
              setSingleFile(res);
              setUploadFlag(!uploadFlag);
              setResetcsvFlag('uploaded');
              setCountOfUpload(countOfUpload + 1);
            },
          });
        });
      } else {
        setHasError(true);
        notifyMessage('Please Choose CSV File', 'Invalid File', 'error');
      }
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        console.log('Canceled from single doc picker');
      } else {
        //For Unknown Error
        notifyMessage('Please Choose CSV File', 'Invalid File', 'error');
      }
    }
  };
  /**
   * For Inserting retrived data  from csv to database .
   * creating table
   * @param {object} tableFormat mapped csv headers into column
   * Insert the fieldMappedData into field_mapping table
   */
  const insertDataIntoDb = async () => {
    setCountOfUpload(countOfUpload + 1);
    await createTable(tableFormat);
    await createFieldMappingTable();
    await insertFieldMappingData(tableFormat, selectedUniqueColumn);
    const uniqueField = await selectFieldMappingUniqueField();
    if (uniqueField) {
      AsyncStorage.setItem('uniqueField', uniqueField[0].unique_field);
    }
    let totalRecords = 0;
    setShowLoader(true);
    for (let user of dataOnCsv) {
      user['is_pass_allocated'] = 0;
      user['pass_issued_on'] = '';
      user[selectedUniqueColumn] = user[selectedUniqueColumn].replace(/ /g, '');

      await insertData(user, selectedUniqueColumn);
      totalRecords++;
    }
    setTotalCount(totalRecords);
    setShowLoader(false);
    setModalVisible(!modalVisible);
    setPossibleColumnsForUniqueKey();
    notifyMessage('Data imported successfully', 'Completed', 'success');
  };

  return (
    <View style={styles.homeScreenMainView}>
      <Portal>
        <Dialog
          style={styles.uploadCsvDailog}
          visible={modalVisible}
          onDismiss={() => hideImportModal()}>
          <View style={styles.uploadCsvCloseCircle}>
            <TouchableOpacity onPress={() => hideImportModal()}>
              <Dialog.Icon icon="close-circle" />
            </TouchableOpacity>
          </View>
          <Dialog.Title style={styles.uploadCsvTitle}>Upload CSV</Dialog.Title>
          <Dialog.Actions style={styles.dailogActions}>
            <View style={styles.modalView}>
              {!showLoader ? (
                <View>
                  <Button
                    style={styles.browseFile}
                    icon="file-document-outline"
                    mode="contained"
                    onPress={selectOneFile}>
                    Browse File
                  </Button>
                  {possibleColumnsForUniqueKey &&
                    possibleColumnsForUniqueKey.length > 0 &&
                    countOfUpload == 1 && (
                      <DropDown
                        placeholder={'select unique column'}
                        mode={'outlined'}
                        visible={showDropDown}
                        showDropDown={() => setShowDropDown(true)}
                        onDismiss={() => setShowDropDown(false)}
                        value={selectedUniqueColumn}
                        setValue={setSelectedUniqueColumn}
                        list={possibleColumnsForUniqueKey}
                        dropDownItemTextStyle={styles.dropDownItemTextStyle}
                      />
                    )}
                  {possibleColumnsForUniqueKey &&
                    possibleColumnsForUniqueKey.length > 0 && (
                      <Button
                        style={styles.submitButton}
                        mode="contained"
                        onPress={insertDataIntoDb}>
                        Submit
                      </Button>
                    )}
                  <HelperText
                    style={styles.helperText}
                    type="error"
                    visible={hasError}>
                    Invalid file, Please choose CSV file!
                  </HelperText>
                </View>
              ) : (
                <View>
                  <Text style={styles.modalText}>
                    Importing data, Please wait....
                  </Text>
                  <ActivityIndicator
                    animating={true}
                    color={MD3Colors.primary40}
                  />
                </View>
              )}
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={reset} onDismiss={() => setReset(!reset)}>
          <Dialog.Title>Reset Data</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to clear all data?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={styles.dailogActions}>
            <Button
              size={24}
              mode="elevated"
              contentStyle={styles.dailogButton}
              onPress={() => setReset(!reset)}>
              Cancel
            </Button>
            <Button
              mode="elevated"
              textColor={MD3Colors.error40}
              contentStyle={styles.dailogButton}
              onPress={() => deleteRecordsFromDataBase()}>
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Provider>
        <View style={styles.settingView}>
          {showSetttings && (
            <View style={styles.settingView2}>
              <Image
                style={styles.tinyLogo}
                source={require('../src/assets/logo.jpg')}
              />
              <Menu
                visible={visible}
                onDismiss={hideMenu}
                anchor={
                  <IconButton
                    icon="cog-outline"
                    iconColor={MD3Colors.neutral50}
                    containerColor={MD3Colors.neutral95}
                    size={24}
                    mode="contained-tonal"
                    onPress={showMenu}
                  />
                }>
                <Menu.Item
                  leadingIcon={{
                    source: 'file-excel-outline',
                    direction: 'ltr',
                    color: MD3Colors.error30,
                    size: 20,
                  }}
                  onPress={loadData}
                  title="Load CSV Data"
                />
                <Divider />
                <Menu.Item
                  contentStyle={{color: MD3Colors.error0}}
                  leadingIcon="delete-outline"
                  onPress={confirmReset}
                  title="Reset All Data"
                />

                {totalCount > 0 && <Divider />}
                {totalCount > 0 && (
                  <Menu.Item
                    contentStyle={{color: MD3Colors.error0}}
                    leadingIcon="car-info"
                    onPress={() => {
                      //
                    }}
                    title="Register Vehicle"
                  />
                )}
              </Menu>
            </View>
          )}
          <View style={styles.bannerView}>
            <ImageBackground
              source={require('../src/assets/bg1.jpg')}
              resizeMethod={'auto'}
              style={styles.bgImageStyle}
              imageStyle={{
                resizeMode: 'center',
              }}></ImageBackground>
          </View>
          <View style={styles.flex2}>
            <Button
              icon={{source: 'file-search-outline', direction: 'ltr', size: 20}}
              contentStyle={styles.homeScreenButtonContent}
              labelStyle={styles.homeScreenButtonLabel}
              style={styles.homeScreenButtons}
              mode="elevated"
              onPress={() =>
                navigation.navigate('Main', {screen: 'SearchVehicle'})
              }>
              Search Vehicle
            </Button>

            <Button
              icon="credit-card-scan-outline"
              contentStyle={styles.homeScreenButtonContent}
              labelStyle={styles.homeScreenButtonLabel}
              style={styles.homeScreenButtons}
              mode="elevated"
              onPress={() =>{}
              //  
              }>
              Scan Number Plate
            </Button>
          </View>
          <Text style={styles.footerText}>
            Powered by Grapelime Innovations pvt ltd
          </Text>
        </View>
      </Provider>
    </View>
  );
};

export default HomeScreen;
