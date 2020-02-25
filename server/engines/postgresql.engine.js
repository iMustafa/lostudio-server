const { Pool, Client } = require('pg')

exports.testConnection = ({ datasource }) => new Promise(async (resolve, reject) => {
  const { config } = datasource
  try {
    const client = new Client(config)
    const connection = await client.connect()
    resolve({ status: true, message: "Database connection test passed" })
  } catch (e) {
    reject(e)
  }
})

exports.getDocList = ({ datasource }) => new Promise(async (resolve, reject) => {
  const { config } = datasource
  try {
    const client = new Client(config)
    await client.connect()
    const query = `
      SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';
    `
    const result = await client.query(query)
    const tables = result.rows.map(row => row.table_name)
    resolve(tables)
  } catch (e) {
    reject(e)
  }
})

exports.getFieldList = ({ datasource, docId }) => new Promise(async (resolve, reject) => {
  const { config } = datasource
  try {
    const client = new Client(config)
    await client.connect()
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${docId}'
    `;
    const result = await client.query(query)
    const fields = result.rows.map(row => row)
    resolve(fields)
  } catch (e) {
    reject(e)
  }
})

exports.queryDatasource = ({ datasource, query }) => new Promise(async (resolve, reject) => {
  const { config } = datasource
  try {
    const client = new Client(config)
    await client.connect()
    const result = await client.query(query)
    const fields = result.rows.map(row => row)
    resolve(fields)
  } catch (e) {
    reject(e)
  }
})