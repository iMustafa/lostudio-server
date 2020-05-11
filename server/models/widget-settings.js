'use strict';
const Engines = require('../engines')
const jsoncsv = require('json-csv')

module.exports = function (Widgetsettings) {

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
        console.log(selectedFields)
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
