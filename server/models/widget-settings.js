'use strict';
const Engines = require('../engines')
const jsoncsv = require('json-csv')

const prepareJSON = (data, selectedFieldsArr) => data.map(e => {
  const obj = {}
  selectedFieldsArr.forEach(field => { obj[field] = e[field] })
  return obj
})

const prepareCSV = async (data, selectedFieldsArr) => {
  try {
    const JSONData = prepareJSON(data, selectedFieldsArr)
    const csvFile = await jsoncsv.buffered(
      JSONData,
      {
        fields: selectedFieldsArr.map(field => ({ name: field, label: field })),
        encoding: 'utf8'
      }
    )
    return csvFile
  } catch (e) {
    return e
  }
}

module.exports = function (Widgetsettings) {

  Widgetsettings.remoteMethod('deleteDocument', {
    description: 'Delete document from widget datasource',
    accessType: 'WRITE',
    isStatic: false,
    accepts: [
      { arg: 'keyId', type: 'string', http: { source: 'query' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'delete', path: '/delete-document' }
  })
  Widgetsettings.prototype.deleteDocument = function (keyId, options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { config } = this
        const datasource = await this.dataSource.get()
        const document = await Engines[datasource.type].deleteDocument({ datasource, config, keyId })
        resolve(document)
      } catch (e) {
        reject(e)
      }
    })
  }

  Widgetsettings.remoteMethod('editDocument', {
    description: 'Edit document into widget datasource',
    accessType: 'WRITE',
    isStatic: false,
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } },
      { arg: 'keyId', type: 'string', http: { source: 'query' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'post', path: '/edit-document' }
  })
  Widgetsettings.prototype.editDocument = function (data, keyId, options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { config } = this
        const datasource = await this.dataSource.get()
        const document = await Engines[datasource.type].editDocument({ datasource, config, data, keyId })
        resolve(document)
      } catch (e) {
        reject(e)
      }
    })
  }

  Widgetsettings.remoteMethod('addDocument', {
    description: 'Insert document into widget datasource',
    accessType: 'WRITE',
    isStatic: false,
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'post', path: '/add-document' }
  })
  Widgetsettings.prototype.addDocument = function (data, options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { config } = this
        const datasource = await this.dataSource.get()
        const document = await Engines[datasource.type].addDocument({ datasource, config, data })
        resolve(document)
      } catch (e) {
        reject(e)
      }
    })
  }

  Widgetsettings.remoteMethod('executeQuery', {
    description: 'Execute widget query',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/execute-query' }
  })
  Widgetsettings.prototype.executeQuery = function (options, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { config } = this
        const datasource = await this.dataSource.get()
        const data = await Engines[datasource.type].executeWidgetQuery({ datasource, config })
        resolve(data)
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  Widgetsettings.remoteMethod('exportData', {
    description: 'Export Widget Data to CSV/JSON files',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'selectedFields', type: 'string', http: { source: 'query' } },
      { arg: 'format', type: 'string', http: { source: 'query' } },
      { arg: 'method', type: 'string', http: { source: 'query' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'res', type: 'object', 'http': { source: 'res' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/export-data' }
  })
  Widgetsettings.prototype.exportData = function (selectedFields, format, method, options, req, res) {
    return new Promise(async (resolve, reject) => {
      try {
        const selectedFieldsArr = JSON.parse(selectedFields)
        const data = await this.executeQuery()
        const type = format == 'csv' ? 'text/csv' : 'application/json'
        const fileData = format == 'csv' ? await prepareCSV(data, selectedFieldsArr) : prepareJSON(data, selectedFieldsArr)
        const blob = new Buffer(fileData, 'utf-8')
        res.setHeader('Content-Type', type)
        res.send(blob)
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }
}
