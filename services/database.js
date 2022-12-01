import {openDatabase} from 'react-native-sqlite-storage';

/**
 *  To connect with Database
 *  Database Name is required
 */
const getConnectedDataBase = () => {
  return (db = openDatabase({name: 'guestDetails.db'}, () => {
    console.log('success'),
      error => {
        console.log('errorr', error);
      };
  }));
};

/**
 * @returns {number} count of all vehicle in the database
 */
export const vehicleFromDatabase = () => {
  getConnectedDataBase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM vehicle_details',
        [],
        (tx, results) => {
          resolve(results.rows.raw()[0]);
        },
      );
    });
  });
};

/**
 *
 * @returns {true} when table is successfully deleted
 */
export const deleteRecords = () => {
  getConnectedDataBase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DROP TABLE IF EXISTS vehicle_details ',
        [],
        (tx, results) => {
          tx.executeSql(
            'DROP TABLE IF EXISTS field_mapping ',
            [],
            (tx, result) => {
              resolve(true);
            },
          );
        },
      );
    });
  });
};
/**
 *
 * @param {object} tableFormat mapped columns from csv headers
 * @returns {object} result object when successfully created table else returns false
 */
export const createTable = tableFormat => {
  getConnectedDataBase();

  return new Promise((resolve, reject) => {
    let query = '';
    for (const key in tableFormat) {
      query += ',' + key + ' VARCHAR(255)';
    }
    db.transaction(txn => {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='vehicle_details'",
        [],
        (tx, res) => {
          if (res.rows.length == 0) {
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS vehicle_details(id INTEGER PRIMARY KEY AUTOINCREMENT ' +
                query +
                ',is_pass_allocated INT(1),pass_issued_on  VARCHAR(20) )',
              [],
              (tx, res) => {
                if (res) {
                  resolve(res);
                } else {
                  resolve(false);
                }
              },
            );
          } else {
            resolve(true);
          }
        },
      );
    });
  });
};

/**
 * Function for creating a filedmapping table  , for saving csv header mapped into columns number
 * @returns {object} result object when successfully created table else returns true
 */
export const createFieldMappingTable = () => {
  getConnectedDataBase();
  return new Promise((resolve, reject) => {
    db.transaction(txn => {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='field_mapping'",
        [],
        (tx, res) => {
          if (res.rows.length == 0) {
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS field_mapping(id INTEGER PRIMARY KEY AUTOINCREMENT ,data TEXT ,unique_field VARCHAR(100))',
              [],
              (tx, res) => {
                if (res) {
                  resolve(res);
                } else {
                  resolve(true);
                }
              },
            );
          } else {
            resolve(true);
          }
        },
      );
    });
  });
};
/**
 *
 * @param {object} data Csv header mapped into column numbers.
 * @param {string} uniqueField value selected for setting unique_field
 * @returns {true} when successfully insert data
 */
export const insertFieldMappingData = (data, uniqueField) => {
  getConnectedDataBase();
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM field_mapping',
          [],
          (tx, results) => {
            let len = results.rows.length;

            if (len == 0) {
              tx.executeSql(
                'INSERT INTO field_mapping (data ,unique_field) VALUES (?,?)',
                [JSON.stringify(data), uniqueField],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    resolve(true);
                  } else resolve(false);
                },
                (transaction, error) => {
                  resolve(false);
                },
              );
            } else {
              resolve(false);
            }
          },
          (transaction, error) => {
            resolve(false);
          },
        );
      });
    } catch (error) {
      console.log(error);
    }
  });
};

/**
 *
 * @param {string} uniqueField unique_filed selected
 * @returns {object} where unique_field data exists
 */
export const selectFieldMappingUniqueField = uniqueField => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT unique_field FROM field_mapping',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.raw());
            } else {
              resolve(false);
            }
          },
        );
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 *
 * @param {object} data values from CSV
 * @param {string} uniqueField selcted unique_fieled
 * @returns
 */
export const insertData = (data, uniqueField) => {
  getConnectedDataBase();
  return new Promise((resolve, reject) => {
    const cols = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).fill('?').join(', ');
    try {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM vehicle_details where ${uniqueField} = ? COLLATE NOCASE`,
          [data[uniqueField].replace(/ /g, '')],
          (tx, results) => {
            let len = results.rows.length;
            if (len == 0) {
              tx.executeSql(
                'INSERT INTO vehicle_details (' +
                  cols +
                  ') VALUES (' +
                  placeholders +
                  ')',
                Object.values(data),
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    resolve(true);
                  } else resolve(false);
                },
                (transaction, error) => {},
              );
            } else {
              const keyValues = [];
              const params = [];
              for (const key in data) {
                keyValues.push(`${key} = ?`);
                params.push(data[key]);
              }
              const sql = `UPDATE vehicle_details SET ${keyValues.toString()} WHERE id = ?`;
              params.push(results.rows.item(0).id);
              tx.executeSql(
                `UPDATE vehicle_details SET ${keyValues.toString()} WHERE id = ?`,
                params,
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    resolve(true);
                  } else resolve(false);
                },
                (transaction, error) => {},
              );
              resolve(false);
            }
          },
          (transaction, error) => {},
        );
      });
    } catch (error) {
      console.log(error);
    }
  });
};
