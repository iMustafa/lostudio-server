const mssql = require('mssql');

exports.checkConnection = ({ datasource }) => new Promise(async (resolve, reject) => {
  try {
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    resolve({ status: true, message: "Database connection test passed" });
  } catch (e) {
    reject({ status: "Connection Failed", data: e });
  }
});

exports.getDocList = ({ datasource }) => new Promise(async (resolve, reject) => {
  const { database } = datasource.config
  try {
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect({ ...datasource.config, options: { encrypt: true } })
    const request = new mssql.Request(connection);
    const query = `
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE='BASE TABLE' AND TABLE_CATALOG='${database}'
         `;
    const data = await request.query(query)
    connection.close();
    const recordset = data.recordset.map(record => { return { docid: record.TABLE_NAME, docname: record.TABLE_NAME } })
    resolve(recordset);
  } catch (e) {
    reject(e);
  }
});

exports.getFieldList = ({ datasource, docId }) => new Promise(async (resolve, reject) => {
  try {
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    const request = new mssql.Request(connection);
    const query = `
          SELECT COLUMN_NAME, DATA_TYPE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${docId}'
        `;
    const data = await request.query(query)
    connection.close();
    const recordset = data.recordset.map(record => { return { fieldname: record.COLUMN_NAME, type: record.DATA_TYPE } })
    resolve(recordset);
  } catch (e) {
    reject(e);
  }

  exports.queryDatasource = ({ datasource, query }) => new Promise(async (resolve, reject) => {
    try {
      const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
      const connection = await ConnectionPool.connect()
      const request = new mssql.Request(connection);
      const data = await request.query(query)
      connection.close();
      resolve(data);
    } catch (e) {
      reject(e);
    }

  });

});