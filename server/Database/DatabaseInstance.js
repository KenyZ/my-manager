console.log('############')
console.log('DATABASE INSTANCE CLASS IN CALLED')
console.log('############')

const databaseConfig = {
  "development": {
    "database": "my-manager",
    "username": "root",
    "password": ""
  },

  "production": {
    "database": "mymanager",
    "username": "root",
    "password": "1234"
  }
}


const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes
const DatabaseInstance = new Sequelize(databaseConfig[process.env.MODE].database, databaseConfig[process.env.MODE].username, databaseConfig[process.env.MODE].password, {
  host: 'localhost',
  dialect: 'mysql',

  logging: false
})

const models = require('./Model/getAllModels')(DatabaseInstance, DataTypes)

module.exports = {
    database: DatabaseInstance,
    models
}

//////////

