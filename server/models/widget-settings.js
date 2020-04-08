'use strict';
const Engines = require('../engines')

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
}
