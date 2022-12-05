import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Text, DataTable, IconButton, MD3Colors} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {viewAllVehicleFromDatabase} from '../services/database';
import styles from '../styles/StyleSheet';

const numberOfItemsPerPageList = [15, 25, 50];

const ViewAllVehicleDetails = props => {
  useEffect(() => {
    setPage(0);
  }, [numberOfItemsPerPage]);

  const {navigation} = props;

  useEffect(async () => {
    const uniqueId = await AsyncStorage.getItem('uniqueField');
    if (uniqueId) {
      setUniqueField(uniqueId);
    }
    const data = await viewAllVehicleFromDatabase(uniqueId);
    setViewAllVehicle([...data]);
  }, []);
  const [viewAllVehicle, setViewAllVehicle] = useState([]);
  const [page, setPage] = React.useState(0);
  const [uniqueField, setUniqueField] = useState();

  const [numberOfItemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0],
  );
  const from = page * numberOfItemsPerPage;
  const to = Math.min((page + 1) * numberOfItemsPerPage, viewAllVehicle.length);
  return (
    <View>
      <View style={styles.fullScreenView}>
        <IconButton
          icon="arrow-left"
          iconColor={MD3Colors.neutral20}
          size={25}
          onPress={() => navigation.goBack()}
          style={styles.backIcon2}
        />
        <Text style={styles.viewVehicleHeader}>Registered Vehicles</Text>
        <Text></Text>
      </View>
      {viewAllVehicle.length > 0 ? (
        <ScrollView style={styles.viewVehicleScrollView}>
          {viewAllVehicle && viewAllVehicle.length > 0 && (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title textStyle={styles.dataTableTitle}>
                  Name
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.dataTableTitle}></DataTable.Title>
                <DataTable.Title textStyle={styles.dataTableTitle2}>
                  Vehicle Number
                </DataTable.Title>
              </DataTable.Header>

              {viewAllVehicle
                .slice(
                  page * numberOfItemsPerPage,
                  page * numberOfItemsPerPage + numberOfItemsPerPage,
                )
                .map((data, index) => {
                  return (
                    <DataTable.Row
                      key={index}
                      onPress={() => {
                        navigation.navigate('Main', {
                          screen: 'SearchVehicle',
                          params: {
                            singleVehicleSelected: data[`${uniqueField}`],
                          },
                        });
                      }}>
                      <DataTable.Cell textStyle={{color: MD3Colors.neutral40}}>
                        {data.column0}
                      </DataTable.Cell>
                      <DataTable.Cell></DataTable.Cell>
                      <DataTable.Cell textStyle={styles.dataTableTitle2}>
                        {data[`${uniqueField}`]}
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })}
              <DataTable.Pagination
                style={{backgroundColor: MD3Colors.secondary30}}
                page={page}
                numberOfPages={Math.ceil(
                  viewAllVehicle.length / numberOfItemsPerPage,
                )}
                onPageChange={page => setPage(page)}
                label={`${from + 1}-${to} of ${viewAllVehicle.length}`}
                showFastPaginationControls
                numberOfItemsPerPageList={numberOfItemsPerPageList}
                numberOfItemsPerPage={numberOfItemsPerPage}
              />
            </DataTable>
          )}
        </ScrollView>
      ) : (
        <Text style={[styles.textAlignView]}>
          {' '}
          No registered vehicles found !!
        </Text>
      )}
    </View>
  );
};

export default ViewAllVehicleDetails;
