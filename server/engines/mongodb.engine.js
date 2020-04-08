const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const fieldsToProjection = (fields) => _(fields).map(field => ({ [field]: 1 })).value()

exports.testConnection = ({ datasource }) => new Promise(async (resolve, reject) => {
  const { db, user, password, server, port } = datasource.config
  const url = user && password ? `mongodb://${user}:${password}@${server}:${port}/${db}` : `mongodb://${server}:${port}/${db}`
  try {
    const connection = await MongoClient.connect(url, { useUnifiedTopology: true })
    await connection.close(true)
    resolve({
      status: true,
      message: "Database connection test passed"
    })
  } catch (e) {
    reject({
      message: "Connection Failed",
      data: e
    })
  }
})

exports.getDocList = ({ datasource }) => new Promise(async (resolve, reject) => {
  const { db, user, password, server, port } = datasource.config
  const url = user && password ? `mongodb://${user}:${password}@${server}:${port}/${db}` : `mongodb://${server}:${port}/${db}`
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true })
    const db = client.db(datasource.config.db)
    const collections = await db.listCollections().toArray()
    resolve(collections.map(collection => collection.name))
  } catch (e) {
    reject(e)
  }
})

exports.getFieldList = ({ datasource, docId }) => new Promise(async (resolve, reject) => {
  const { db, user, password, server, port } = datasource.config
  const url = user && password ? `mongodb://${user}:${password}@${server}:${port}/${db}` : `mongodb://${server}:${port}/${db}`
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true })
    const db = client.db(datasource.config.db)
    const fieldList = await db.collection(docId).mapReduce(
      function () {
        for (var key in this) { emit(key, null) }
      },
      function () {
        return null
      },
      { out: { inline: 1 } }
    )
    resolve(fieldList.map(key => key._id))
  } catch (e) {
    reject(e)
  }
})


exports.queryDatasource = ({ datasource, docId, query }) => new Promise(async (resolve, reject) => {
  const { db, user, password, server, port } = datasource.config
  const url = user && password ? `mongodb://${user}:${password}@${server}:${port}/${db}` : `mongodb://${server}:${port}/${db}`
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true })
    const db = client.db(datasource.config.db)
    const collection = db.collection(docId)
    const queryResult = await collection.find(query).toArray()
    resolve(queryResult)
  } catch (e) {
    reject(e)
  }
})

exports.executeWidgetQuery = ({ datasource, config }) => new Promise(async (resolve, reject) => {
  try {
    const { db, user, password, server, port } = datasource.config
    const { docId, fields, type, func, query } = config
    const url = user && password ? `mongodb://${user}:${password}@${server}:${port}/${db}` : `mongodb://${server}:${port}/${db}`
    const client = await MongoClient.connect(url, { useUnifiedTopology: true })
    const $db = client.db(db)
    const collection = $db.collection(docId)
    const queryResult = await collection[func](query).project(Object.assign({}, ...fieldsToProjection(fields))).toArray()
    resolve(queryResult)
  } catch (e) {
    reject(e)
  }
})