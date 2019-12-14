
/**
 * GET ENV VARIABLES
 */
const dotenv = require('dotenv').config()


/**
 * CORE
 */
const express = require('express')
const app = express()
const {sequelize, models} = require('./sequelize')

/**
 * UTILS
 */
const path = require('path') 

/**
 * SERVER CONSTANTS
 */
const PORT = 3000

/**
 * ALLOW ACCESS APP
 */
app.use('/', express.static('public'))

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})


/**
 * START
 */

app.listen(PORT, () => console.log(`Server running on PORT=${PORT}, MODE=${process.env.MODE}`))


const UserRepository = require('./Repository/UserRepository')(sequelize, models)
const ChatRepository = require('./Repository/ChatRepository')(sequelize, models)
const MessageRepository = require('./Repository/MessageRepository')(sequelize, models)


/**
 * API ROUTER
 */

const RoutesAPI = require('./Routes/routes.api')
const RouterAPI = express.Router()
const initApiResponse = (req, res, next) => {

  res.locals.response = {
      error: false,
      data: {}
  }
  next()
}

RouterAPI.use(initApiResponse)
RouterAPI.use(express.json())
app.use('/api', RoutesAPI(RouterAPI, {
  UserRepository,
  ChatRepository,
  MessageRepository,
}))


