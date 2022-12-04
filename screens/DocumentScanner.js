import React, {useRef, useState, useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Platform} from 'react-native';
import Permissions from 'react-native-permissions';
import PDFScanner from '@woonivers/react-native-document-scanner';
import styles from '../styles/StyleSheet';

const DocumentScanner =(props) =>{
  const {navigation} = props;
  const pdfScannerElement = useRef(null);
  const [data, setData] = useState({});
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const  requestCamera= async() =>{
      const result = await Permissions.request(
        Platform.OS === 'android'
          ? 'android.permission.CAMERA'
          : 'ios.permission.CAMERA',
      );
      if (result === 'granted') setAllowed(true);
    }
    requestCamera();
  }, []);

  function handleOnPressRetry() {
    setData({});
  }
  const handleOnPress =() =>{
    pdfScannerElement.current.capture();
  }
  if (!allowed) {
    console.log('You must accept camera permission');
    return (
      <View style={styles.permissions}>
        <Text>You must accept camera permission</Text>
      </View>
    );
  }
  if (data.croppedImage) {
    navigation.navigate('Main', {
      screen: 'SearchVehicle',
      params: {croppedImageUrl: data.croppedImage},
    });
  }
  return (
    <React.Fragment>
      <PDFScanner
        ref={pdfScannerElement}
        style={styles.scanner}
        onPictureTaken={setData}
        overlayColor="rgba(255,130,0, 0.7)"
        enableTorch={false}
        quality={0.5}
        detectionCountBeforeCapture={5}
        detectionRefreshRateInMS={50}
      />
      <TouchableOpacity onPress={handleOnPress} style={styles.buttonScanner}>
        <Text style={styles.buttonText}>Take picture</Text>
      </TouchableOpacity>
    </React.Fragment>
  );
}
export default DocumentScanner
