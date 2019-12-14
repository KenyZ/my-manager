require('dotenv').config()

const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes
const sequelize = new Sequelize(
  
  process.env.DB_NAME, 

  process.env.DB_USER, 

  process.env.DB_PASSWORD, 

  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  } 
)

sequelize.authenticate()
.catch(err => console.error("==== UNABLE TO CONNECT DATABASE ====", err))
.then(() => console.log("==== DATABASE CONNECTED ===="))

const models = require('./Models/model.index')(sequelize, DataTypes)

module.exports = {
    sequelize: sequelize,
    models
}

//////////

