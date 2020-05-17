const mssql = require('mssql');
var jsonSql = require('json-sql')();

exports.testConnection = ({ datasource }) => new Promise(async (resolve, reject) => {
  try {
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    resolve({ status: true, message: "Database connection test passed" });
  } catch (e) {
    console.log('>> CONNECTION ERROR')
    console.log(e)
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
    const recordset = data.recordset.map(record => record.TABLE_NAME)
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
    // const recordset = data.recordset.map(record => { return { fieldname: record.COLUMN_NAME, type: record.DATA_TYPE } })
    const recordset = data.recordset.map(record => record.COLUMN_NAME)
    resolve(recordset);
  } catch (e) {
    reject(e);
  }
});

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

exports.executeWidgetQuery = ({ datasource, config }) => new Promise(async (resolve, reject) => {
  try {
    const { docId, fields, query } = config
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    const request = new mssql.Request(connection);
    const sql = jsonSql.build({
      type: 'select',
      table: docId,
      fields,
      condition: query
    })
    const data = await request.query(sql.query)
    connection.close()
    resolve(data)
  } catch (e) {
    reject(e)
  }
})

exports.addDocument = ({ datasource, config, data }) => new Promise(async (resolve, reject) => {
  try {
    const { docId } = config
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    const request = new mssql.Request(connection);
    const sql = jsonSql.build({
      type: 'insert',
      table: docId,
      values: data
    })
    const $data = await request.query(sql.query)
    connection.close()
    resolve($data)
  } catch (e) {
    reject(e)
  }
})

exports.editDocumnet = ({ datasource, config, data, keyId }) => new Promise(async (resolve, reject) => {
  try {
    const { docId, primaryKey } = config
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    const request = new mssql.Request(connection);
    const sql = jsonSql.build({
      type: 'update',
      table: docId,
      conditions: { [primaryKey]: keyId },
      modifier: data
    })
    const $data = await request.query(sql.query)
    connection.close()
    resolve($data)
  } catch (e) {
    reject(e)
  }
})

exports.deleteDocument = ({ datasource, config, keyId }) => new Promise(async (resolve, reject) => {
  try {
    const { docId, primaryKey } = config
    const ConnectionPool = new mssql.ConnectionPool({ ...datasource.config, options: { encrypt: true } });
    const connection = await ConnectionPool.connect()
    const request = new mssql.Request(connection);
    const sql = jsonSql.build({
      type: 'remove',
      table: docId,
      condition: { [primaryKey]: keyId }
    })
    const data = await request.query(sql.query)
    connection.close();
    resolve(data);
  } catch (e) {
    reject(e)
  }
})