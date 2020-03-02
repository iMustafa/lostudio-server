'use strict';
const Engines = require('../engines')

module.exports = function (Datasource) {

  Datasource.beforeRemote('create', (ctx, _, _next) => new Promise(async (resolve, reject) => {
    const { data } = ctx.args
    try {
      const connection = await Engines[data.type].testConnection({ datasource: data })
      resolve()
    } catch (e) {
      reject(e)
    }
  }))

  Datasource.remoteMethod('testConnection', {
    description: 'check connection to data engine',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/test-connection' }
  })

  Datasource.prototype.testConnection = function (options, req) {
    return Engines[this.type].testConnection({ datasource: this })
  }

  Datasource.remoteMethod('getDocList', {
    description: 'Get Documents List of A table',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/doc-list' }
  })

  Datasource.prototype.getDocList = function (options, req) {
    return Engines[this.type].getDocList({ datasource: this })
  }

  Datasource.remoteMethod('getFieldList', {
    description: 'Get fields list of a table',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'docId', type: 'string', http: { source: 'query' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/field-list' }
  })

  Datasource.prototype.getFieldList = function (docId, options, req) {
    return Engines[this.type].getFieldList({ datasource: this, docId })
  }

  Datasource.remoteMethod('queryDataSource', {
    description: 'Post a query to the datasource',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'docId', type: 'string', http: { source: 'query' } },
      { arg: 'query', type: 'object', http: { source: 'body' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'post', path: '/query' }
  })

  Datasource.prototype.queryDataSource = function (docId, query, options, req) {
    return Engines[this.type].queryDatasource({ datasource: this, docId, query })
  }

}
