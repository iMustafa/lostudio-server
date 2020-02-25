const mongodb = require('./mongodb.engine')
const postgresql = require('./postgresql.engine')
const mssql = require('./sqlserver.engine')

module.exports = {
  mongodb,
  postgresql,
  mssql
}