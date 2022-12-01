import {StyleSheet} from 'react-native';
import {MD3Colors} from 'react-native-paper';

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: MD3Colors.neutral90,
  },
  customModalView: {
    height: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  button: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
    borderColor: '#CCC',
    borderRadius: 100,
    borderWidth: 2,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  textStyle: {
    color: '#CCC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#444',
  },
  buttonStyle: {
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  SearchButton: {
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  DlButtonStyle: {
    backgroundColor: '#721c24',
    borderWidth: 2,
    borderColor: '#f8d7da',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
  },
  buttonTextStyle: {
    color: '#CCC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '70%',
    borderWidth: 1,
    padding: 10,
    borderColor: '#444',
    borderRadius: 8,
    color: '#444',
  },
  qLabel: {
    fontWeight: 'bold',
    color: MD3Colors.primary30,
    fontSize: 15,
    marginBottom: 5,
  },
  qValue: {
    fontWeight: 'bold',
    color: '#444',
    paddingLeft: 10,
  },
  passIssued: {
    color: '#FFF',
    backgroundColor: '#208d38',
    borderWidth: 2,
    borderColor: '#c3e6cb',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
  },
  issuePass: {
    color: '#FFF',
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  titleText: {
    color: '#444',
  },
  flex2: {
    flex: 2,
    backgroundColor: MD3Colors.primary40,
    justifyContent: 'center',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    padding: 50,
  },
  flex1: {
    flex: 1,
    borderTopStartRadius: 30,
  },
  modalStyle: {
    padding: 20,
  },
  fullScreenModalStyle: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    margin: 0,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    marginLeft: 16,
    marginBottom: 10,
    left: 0,
    bottom: 0,
  },
  devider: {
    marginTop: 10,
    marginBottom: 10,
  },
  scanner: {
    flex: 1,
    aspectRatio: undefined,
  },
  buttonScanner: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  permissions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeScreenMainView: {
    flex: 1,
    flexDirection: 'column',
  },
  uploadCsvDailog: {
    height: 300,
    backgroundColor: MD3Colors.neutral90,
    borderRadius: 30,
  },
  uploadCsvCloseCircle: {
    alignItems: 'flex-end',
    marginRight: 15,
    marginTop: -18,
  },
  uploadCsvTitle: {
    textAlign: 'center',
  },
  dailogActions: {
    justifyContent: 'space-around',
  },
  browseFile: {
    marginBottom: 20,
  },
  dropDownItemTextStyle: {
    color: 'black',
  },
  submitButton: {
    marginTop: 20,
  },
  helperText: {
    textAlign: 'center',
  },
  dailogButton: {
    width: 100,
  },
  settingView: {
    flex: 1,
    justifyContent: 'center',
  },
  settingView2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: MD3Colors.neutralVariant100,
  },
  bannerView: {
    flex: 1,
    backgroundColor: MD3Colors.primary100,
    justifyContent: 'flex-start',
  },
  bgImageStyle: {
    height: 250,
  },
  homeScreenButtonContent: {
    height: 70,
  },
  homeScreenButtonLabel: {
    fontSize: 20,
  },
  homeScreenButtons: {
    marginBottom: 20,
    borderRadius: 50,
  },
  footerText: {
    alignSelf: 'center',
    bottom: 0,
    margin: 0,
    fontSize: 10,
    backgroundColor: MD3Colors.primary40,
    width: '100%',
    textAlign: 'center',
    paddingBottom: 5,
  },
  fullScreenView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    alignItems: 'flex-start',
    marginLeft: -5,
  },
  searchVehicleHeader: {
    fontSize: 16,
  },
  searchVehicleViewScroll: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  searchView2: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  dropDownRightIcon: {
    height: 30,
    alignSelf: 'center',
  },
  inputContainerStyle: {
    borderRadius: 25,
    borderColor: MD3Colors.error50,
    width: '100%',
  },
  suggestionsListContainerStyle: {
    backgroundColor: MD3Colors.neutral40,
    borderColor: MD3Colors.neutral40,
  },
  containerStyle: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
  },
  dropDownText: {
    color: '#fff',
    padding: 15,
  },
  approvedImage: {
    height: 350,
    width: 350,
    top: 0,
  },
  issuedPassTextStyle: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    color: MD3Colors.primary40,
  },
  buttonRevert: {
    marginBottom: 10,
  },
  noDataFoundStyle: {
    color: MD3Colors.neutral40,
    textAlign: 'center',
    marginTop: 100,
  },
  noDataFoundStyle2: {
    fontWeight: 'bold',
  },
  similarResultView: {
    marginTop: 50,
  },
  similarResultText: {
    textAlign: 'left',
    marginBottom: 10,
    fontSize: 16,
    marginLeft: 10,
  },
  similarResultView2: {
    flex: 1,
    flexDirection: 'row',
  },
  chipStyle: {
    width: 110,
    marginLeft: 10,
    marginBottom: 10,
  },
  mainView3: {
    width: '100%',
  },
  addVehicleView: {
    marginTop: 20,
  },
  backIcon2: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  viewVehicleHeader: {
    fontSize: 16,
    marginLeft: -50,
    color: MD3Colors.neutral40,
  },
  viewVehicleScrollView: {
    marginBottom: 50,
  },
  dataTableTitle: {
    textAlign: 'center',
    color: MD3Colors.neutral40,
  },
  dataTableTitle2: {
    textAlign: 'left',
    color: MD3Colors.neutral40,
  },
});

export default styles;
