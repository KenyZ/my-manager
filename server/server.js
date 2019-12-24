
if(typeof process.env.MODE === "undefined"){
  require('dotenv').config()
}


/**
 * CORE
 */
const express = require('express')
const app = express()
const RouterAPI = express.Router()
const path = require('path') 

/**
 * MODULES
 */
const { sequelize, ...models} = require('./database')
const routes = require('./routes')


const PORT = 3001


sequelize.authenticate().then(() => {
  console.log("#### DATABASE CONNECTED ####")
})

/**
 * INIT ROUTER
 */

// FOR API
RouterAPI.use(express.json()) 
routes(RouterAPI, {...models})
app.use('/api', RouterAPI)


// FOR APP
app.use('/', express.static('public'))

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})


app.listen(PORT, () => console.log(`####  Server running on PORT=${PORT}, MODE=${process.env.MODE}  ####`))





