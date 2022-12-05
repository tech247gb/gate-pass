import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {Provider} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SearchVehicle from './screens/SearchVehicle';
import DocumentScanner from './screens/DocumentScanner';
import AddVehicleDetails from './screens/AddVehicleDetails';

const Stack = createNativeStackNavigator();

const Main = () => {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SearchVehicle"
        component={SearchVehicle}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DocumentScanner"
        component={DocumentScanner}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddVehicleDetails"
        component={AddVehicleDetails}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Provider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerTitleAlign: 'center',
            headerTransparent: false,
            headerBackTitle: ' ',
          }}>
          <Stack.Screen
            name="Main"
            component={Main}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </Provider>
  );
};
export default AppNavigator;
