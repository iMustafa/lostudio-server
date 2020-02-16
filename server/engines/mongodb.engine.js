const MongoClient = require('mongodb').MongoClient

exports.testConnection = (datasource) => new Promise(async (resolve, reject) => {
  const { url } = datasource.config
  try {
    const connection = await MongoClient.connect(url, { useUnifiedTopology: true })
    await connection.close(true)
    resolve({
      status: true,
      message: "Database connection test passed"
    })
  } catch (e) {
    reject(e)
  }
})

exports.getDocList = (datasource) => new Promise(async (resolve, reject) => {
  const { server, port } = datasource.config
  try {
    const client = await MongoClient.connect(`mongodb://${server}:${port}`, { useUnifiedTopology: true })
    const db = client.db(datasource.config.db)
    const collections = await db.listCollections().toArray()
    resolve(collections.map(collection => collection.name))
  } catch (e) {
    reject(e)
  }
})

exports.getFieldList = (datasource, docId) => new Promise(async (resolve, reject) => {
  const { server, port } = datasource.config
  try {
    const client = await MongoClient.connect(`mongodb://${server}:${port}`, { useUnifiedTopology: true })
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

exports.getValueList = (datasource, docId, fieldId) => new Promise(async (resolve, reject) => {

})

exports.queryDatasource = (datasource, docId) => new Promise(async (resolve, reject) => {

})