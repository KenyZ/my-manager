console.log('############')
console.log('DATABASE INSTANCE CLASS IN CALLED')
console.log('############')


const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes
const DatabaseInstance = new Sequelize('my-manager', 'root', '', {
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

