import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {
  Button,
  IconButton,
  MD3Colors,
  Divider,
  Text,
  Chip,
} from 'react-native-paper';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {useIsFocused} from '@react-navigation/native';
let stringSimilarity = require('string-similarity');
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  viewVehicleDetails,
  regexVehicleNumberFinder,
  autoCompleteDataFromDb,
  issuePass,
  revertPass,
} from '../services/database';
import styles from '../styles/StyleSheet';

const SearchVehicle = props => {
  const [userData, setUserData] = useState({});
  const [suggestionsList, setSuggestionsList] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [similarResult, setSimilarResult] = useState([]);
  const [uniqueField, setUniqueField] = useState();
  const isFocused = useIsFocused();
  const croppedImageUrl = props?.route?.params?.croppedImageUrl;
  const {navigation} = props;

  useEffect(async () => {
    const uniqueId = await AsyncStorage.getItem('uniqueField');
    if (uniqueId) {
      setUniqueField(uniqueId);
    }
  }, [isFocused]);

  /** UseEffect for identifying navigation from edit page */
  useEffect(() => {
    if (
      typeof editedVehicleNumber != 'undefined ' &&
      editedVehicleNumber != null
    ) {
      viewVehicleFromDatabase(editedVehicleNumber, uniqueField);
      props.navigation.setParams({vehicleNumber: null});
    }
  }, [editedVehicleNumber]);

  /** UseEffect for identifying navigation From Document Scanner */
  useEffect(async () => {
    if (croppedImageUrl) {
      const result = await TextRecognition.recognize(croppedImageUrl);
      const spaceRemovedText = result.text.split('\n').join('');
      let re = /[a-zA-Z][a-zA-Z][0-9]{1,2}[a-zA-Z]{1,2}[0-9]{1,4}/gi;
      let re2 = /[a-zA-Z][a-zA-Z][0-9]{1,2}[0-9]{1,4}/gi;
      let indRemovedtext = spaceRemovedText.replace('IND', '');
      let zeroReplacingText = indRemovedtext.replace('O', 0);
      let specialCharachterRemovedText = zeroReplacingText.replace(
        /[^A-Z0-9]/gi,
        '',
      );
      let reString = specialCharachterRemovedText.match(re);
      let vechicleRegistrationNumber = reString ? reString[0] : '';
      if (vechicleRegistrationNumber == '') {
        reString = indRemovedtext.match(re2);
        vechicleRegistrationNumber = reString ? reString[0] : '';
      }
      setSearchQuery(vechicleRegistrationNumber);
      const vehicleDetails = await viewVehicleFromDatabase(
        vechicleRegistrationNumber,
        uniqueField,
      );
      if (vehicleDetails) {
        return;
      } else {
        const dbVehicleNumbersLike = await regexVehicleNumberFinder(
          vechicleRegistrationNumber,
          uniqueField,
        );
        const matchingArray = [];
        dbVehicleNumbersLike.map(data => {
          matchingArray.push(data[uniqueField]);
        });
        if (matchingArray.length > 0) {
          let matches = stringSimilarity.findBestMatch(
            `${vechicleRegistrationNumber}`,
            matchingArray,
          );
          const similarResultArray = [];
          if (matches.bestMatch.rating > 0.12) {
            matches.ratings.map(result => {
              if (result.rating > 0.11) {
                similarResultArray.push(result.target);
              }
            });
            setSimilarResult(similarResultArray);
          } else {
            notifyMessage('No matching result found', 'Failed', 'error');
          }
        } else {
          notifyMessage('No matching result found', 'Failed', 'error');
        }
      }
    }
  }, [croppedImageUrl]);

  /*
  AutoCompleteDropdown functionality starts here
  */

  const searchRef = useRef(null);

  /** function for gettting suggestions from database based on the input */
  const getSuggestions = useCallback(
    async q => {
      const filterToken = q.toLowerCase();
      if (typeof q !== 'string' || q.length < 3) {
        setSuggestionsList(null);
        return;
      }
      setLoading(true);
      // Function call
      const response = await autoCompleteDataFromDb(filterToken, uniqueField);
      const suggestions = response.map((matchingResult, index) => ({
        id: index,
        title: matchingResult[uniqueField],
      }));

      setSuggestionsList(suggestions);
      setLoading(false);
    },
    [uniqueField],
  );

  const [loading, setLoading] = useState(false);
  const dropdownController = useRef(null);

  const onClearPress = useCallback(() => {
    setSuggestionsList(null);
    setFieldMapping({});
    setUserData({});
  }, []);

  const onOpenSuggestionsList = useCallback(isOpened => {}, []);

  /*
  AutoCompleteFunctionality ends here
  */

  /** Function for issue pass */
  const issuePasstoVehicle = async id => {
    const userDataFromDb = await issuePass(id, userData);
    setUserData({});
    if (userDataFromDb) {
      setUserData(userDataFromDb);
    } else {
      notifyMessage('No data found', 'Failed', 'error');
    }
  };

  /** Revert Pass Confirmation */
  const revertPassconfirmation = id => {
    Alert.alert('Revert Pass', 'Are you sure you want to revert pass?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => revertPassToVehicle(id)},
    ]);
  };

  /** Revert Pass */
  const revertPassToVehicle = async id => {
    const revertedPass = await revertPass(id, userData);
    setUserData({});
    if (revertedPass) {
      setUserData(revertedPass);
    } else {
      notifyMessage('No data found', 'Failed', 'error');
    }
  };

  const notifyMessage = (msg, title, type) => {
    Toast.show({
      type: type,
      text1: title,
      text2: msg,
      position: 'bottom',
    });
  };

  /** Search function for getting searched element in database */
  const viewVehicleFromDatabase = async vehicleNumber => {
    const dataFromDb = await viewVehicleDetails(vehicleNumber, uniqueField);
    if (Object.keys(dataFromDb).length > 0) {
      setUserData(dataFromDb.userData);
      setFieldMapping(dataFromDb.fieldMapping);
    }
  };
  return (
    <>
      <View style={styles.fullScreenModalStyle}>
        <View style={styles.fullScreenView}>
          <IconButton
            icon="arrow-left"
            iconColor={MD3Colors.neutral20}
            size={25}
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backIcon}
          />
          <Text style={styles.searchVehicleHeader}>Search Vehicle</Text>
          {userData && userData.id != null ? (
            <Button
              mode="contained"
              onPress={() => {
                navigation.navigate('Main', {
                  screen: 'AddVehicleDetails',
                  params: {vehicleId: userData.id},
                });
              }}>
              Edit
            </Button>
          ) : (
            <Text></Text>
          )}
        </View>
        <ScrollView>
          <View style={styles.searchVehicleViewScroll}>
            <View styles={styles.mainView3}>
              <View
                style={[
                  styles.searchView2,
                  Platform.select({ios: {zIndex: 1}}),
                ]}>
                <AutocompleteDropdown
                  ref={searchRef}
                  controller={controller => {
                    dropdownController.current = controller;
                  }}
                  direction={Platform.select({ios: 'down'})}
                  dataSet={suggestionsList}
                  onChangeText={getSuggestions}
                  onSelectItem={item => {
                    item && viewVehicleFromDatabase(item.title);
                  }}
                  debounce={1000}
                  suggestionsListMaxHeight={
                    Dimensions.get('window').height * 0.3
                  }
                  onClear={onClearPress}
                  onOpenSuggestionsList={onOpenSuggestionsList}
                  loading={loading}
                  clearOnFocus={false}
                  useFilter={false} // set false to prevent rerender twice
                  textInputProps={{
                    placeholder: 'Vehicle Number',
                    autoCorrect: false,
                    autoCapitalize: 'none',
                    style: {
                      borderRadius: 25,
                      color: MD3Colors.neutral20,
                      paddingLeft: 18,
                      width: '100%',
                    },
                  }}
                  rightButtonsContainerStyle={styles.dropDownRightIcon}
                  inputContainerStyle={styles.inputContainerStyle}
                  suggestionsListContainerStyle={
                    styles.suggestionsListContainerStyle
                  }
                  containerStyle={styles.containerStyle}
                  renderItem={(item, text) => (
                    <Text style={styles.dropDownText}>{item.title}</Text>
                  )}
                  ChevronIconComponent={
                    <Feather
                      name="chevron-down"
                      size={20}
                      color={MD3Colors.neutral40}
                    />
                  }
                  ClearIconComponent={
                    <Feather
                      name="x-circle"
                      size={18}
                      color={MD3Colors.neutral40}
                    />
                  }
                  inputHeight={50}
                  showChevron={false}
                  closeOnBlur={false}
                />
                <View style={{width: 10}} />
                <Button
                  style={{flexGrow: 0}}
                  title="Toggle"
                  onPress={() => dropdownController.current.toggle()}
                />
              </View>
              {fieldMapping &&
              userData &&
              userData.is_pass_allocated != null ? (
                <View>
                  {userData.is_pass_allocated > 0 ? (
                    <ImageBackground
                      source={require('../src/assets/approved.png')}
                      resizeMethod={'auto'}
                      style={{}}
                      imageStyle={styles.approvedImage}>
                      <View>
                        {fieldMapping &&
                          Object.keys(fieldMapping).map((detail, id) => {
                            return (
                              <View key={id}>
                                <Text key={id} style={styles.qLabel}>
                                  {fieldMapping[detail]}
                                </Text>
                                <Text style={styles.qValue}>
                                  {userData[detail]}
                                </Text>
                                <Divider style={styles.devider} />
                              </View>
                            );
                          })}

                        {userData.is_pass_allocated > 0 ? (
                          <View>
                            <Text style={styles.issuedPassTextStyle}>
                              Pass issued on : {userData.pass_issued_on}
                            </Text>
                            <Button
                              icon="cancel"
                              mode="elevated"
                              style={styles.buttonRevert}
                              buttonColor={MD3Colors.error50}
                              textColor={MD3Colors.neutral100}
                              onPress={() =>
                                revertPassconfirmation(userData.id)
                              }>
                              Revert Pass
                            </Button>
                          </View>
                        ) : (
                          <Button
                            icon="account-check-outline"
                            mode="elevated"
                            buttonColor={MD3Colors.primary40}
                            textColor={MD3Colors.neutral100}
                            onPress={() => issuePasstoVehicle(userData.id)}>
                            Issue Pass
                          </Button>
                        )}
                      </View>
                    </ImageBackground>
                  ) : (
                    <View>
                      {fieldMapping &&
                        Object.keys(fieldMapping).map((detail, id) => {
                          return (
                            <View key={id}>
                              <Text style={styles.qLabel}>
                                {fieldMapping[detail]}
                              </Text>
                              <Text style={styles.qValue}>
                                {userData[detail]}
                              </Text>
                              <Divider style={styles.devider} />
                            </View>
                          );
                        })}
                      {userData.is_pass_allocated > 0 ? (
                        <View>
                          <Text style={styles.issuedPassTextStyle}>
                            Pass issued on : {userData.pass_issued_on}
                          </Text>
                          <Button
                            icon="cancel"
                            mode="elevated"
                            style={styles.buttonRevert}
                            buttonColor={MD3Colors.error50}
                            textColor={MD3Colors.neutral100}
                            onPress={() => revertPassconfirmation(userData.id)}>
                            Revert Pass
                          </Button>
                        </View>
                      ) : (
                        <Button
                          icon="account-check-outline"
                          mode="elevated"
                          buttonColor={MD3Colors.primary40}
                          textColor={MD3Colors.neutral100}
                          onPress={() => issuePasstoVehicle(userData.id)}>
                          Issue Pass
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  {searchQuery != '' && (
                    <Text style={styles.noDataFoundStyle}>
                      No data found for vehicle number{' '}
                      <Text style={styles.noDataFoundStyle2}>
                        {' '}
                        {searchQuery}
                      </Text>
                    </Text>
                  )}
                  {similarResult.length > 0 && (
                    <View style={styles.similarResultView}>
                      <Text style={styles.similarResultText}>
                        Similar Results Found
                      </Text>
                      <View style={styles.similarResultView2}>
                        {Object.keys(similarResult).map(function (detail, id) {
                          return (
                            <Chip
                              key={{id}}
                              elevated={true}
                              style={styles.chipStyle}
                              onPress={() =>
                                viewVehicleFromDatabase(similarResult[detail])
                              }>
                              {similarResult[detail]}
                            </Chip>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        <Toast />
      </View>
    </>
  );
};
export default SearchVehicle;
