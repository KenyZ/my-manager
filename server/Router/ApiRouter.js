
const express = require('express')
const router = express.Router()

const ServerConstants = require('../ServerConstants')

const {database, models} = require('../Database/DatabaseInstance')

const initApiResponse = (req, res, next) => {

    res.locals.response = {
        error: false,
        data: {}
    }
    next()
}

router.use(initApiResponse)
router.use(express.json())


const jwt = require('jsonwebtoken')
const JwtStrategyOptions = {
    secretOrKey : 'mysecretkeyforjwtpassport',
    token_key: '__token_access__'
}

const getTokenFromReq = req => {
    const {token = ""} = req.body

    let decodedToken = null

    try {
        decodedToken = jwt.decode(token, JwtStrategyOptions.secretOrKey) || null
    } catch (error) {
        
    }

    return decodedToken
}
const needAuth = async (req, res, next) => {
    
    const decodedToken = getTokenFromReq(req)

    if(decodedToken && decodedToken.id){
        UserRepository.findById(decodedToken.id).then(user => {
            if(user){
                return next()
            } else {
                res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
                return res.send(res.locals.response)   
            }
        })
    } else {
        res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
        return res.send(res.locals.response)    
    }

}


const UserRepository = require('../Database/Repository/UserRepository')(database, models)
const ChatRepository = require('../Database/Repository/ChatRepository')(database, models)
const MessageRepository = require('../Database/Repository/MessageRepository')(database, models)


router.get('/test', async (req, res) => {

    return ChatRepository.test().then(data => {

        res.locals.response.data = data
        res.send(res.locals.response)
    })

})

router.post('/message/create', async (req, res) => {

    const decodedToken = getTokenFromReq(req)
    const {chat: chatId, message} = req.body

    if(decodedToken && decodedToken.id){
        return MessageRepository.create(message.text, decodedToken.id, chatId).then(message => {
            
            if(!message){
                res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
                return
            }

            res.locals.response.data.message = message
            res.send(res.locals.response)    
        })
    } else {
        res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
        // return res.send(res.locals.response)    
    }  
    
    return res.send(res.locals.response)

})

router.post('/chat/:chatId', async (req, res) => {

    const decodedToken = getTokenFromReq(req)

    // const decodedToken = {id: 1}
    const chatId = req.params.chatId

    if(decodedToken && decodedToken.id){
        return UserRepository.findById(decodedToken.id).then(user => {

            if(!user){
                res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
                return;
            }

            return ChatRepository.getChat(chatId, decodedToken.id).then(chat => {
                res.locals.response.data.chat = chat
                res.send(res.locals.response)
            })
        })
    } else {
        res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
        // return res.send(res.locals.response)    
    }  
    
    return res.send(res.locals.response) 
})

router.post('/discussions', async (req, res) => {

    const decodedToken = getTokenFromReq(req)

    // const decodedToken = {id: 1}
    
    if(decodedToken && decodedToken.id){
        return ChatRepository.findAllDiscussionsOf(decodedToken.id).then(chats => {

            res.locals.response.data.chats = chats
            res.send(res.locals.response)
        })
    } else {
        res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
        return res.send(res.locals.response)    
    }    
})

router.post('/user', async (req, res) => {

    const decodedToken = getTokenFromReq(req)
    
    if(decodedToken && decodedToken.id){
        return UserRepository.getInfo(decodedToken.id).then(user => {
            res.locals.response.data.user = user.get()
            res.send(res.locals.response)
        })
    } else {
        res.locals.response.error = ServerConstants.API_ERROR.MUST_BE_AUTH
        return res.send(res.locals.response)    
    }
})

router.post('/login', async (req, res) => {

    const {username, password} = req.body

    return UserRepository.login(username, password).then(userFound => {

        if(userFound){
            res.locals.response.data['token'] = jwt.sign({
                id: userFound.id
            }, JwtStrategyOptions.secretOrKey)
        } else {
            res.locals.response.error = ServerConstants.API_ERROR.USER_NOT_FOUND
        }

        res.send(res.locals.response)    
    })

})


router.post('/authenticate', async (req, res) => {

    const decodedToken = getTokenFromReq(req)

    return !decodedToken ? res.send(res.locals.response) : UserRepository.findById(decodedToken.id || null).then(user => {
        res.locals.response.data.access = user !== null
        res.send(res.locals.response)
    })

})


module.exports = router