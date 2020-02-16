'use strict';
const Engines = require('../engines')

module.exports = function (Datasource) {

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

  Datasource.prototype.testConnection = function (req) {
    return Engines[this.type].testConnection(this)
  }

  Datasource.remoteMethod('getDocList', {
    description: 'check connection to data engine',
    accessType: 'READ',
    isStatic: false,
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/doc-list' }
  })

  Datasource.prototype.getDocList = function (req) {
    return Engines[this.type].getDocList(this)
  }

  Datasource.remoteMethod('getFieldList', {
    description: 'check connection to data engine',
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
    return Engines[this.type].getFieldList(this, docId)
  }

}
