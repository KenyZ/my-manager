

const jwt = require('jsonwebtoken'),
    ServerParameters = require('../utils/ServerParameters')
    
module.exports = (router, {
    UserRepository,
    ChatRepository,
    MessageRepository,
}) => {


        
    const Helpers = {

        verifyToken: async token => {
            let decodedToken = jwt.decode(token, ServerParameters.TOKEN_SECRET) || null

            if(decodedToken){
                try {
                    let verifiedToken = jwt.verify(token, ServerParameters.TOKEN_SECRET)
                } catch (VerifyTokenError) {
                    // console.error({VerifyTokenError})
                    return false
                }
            } 

            return decodedToken
        },

        getTokenFromReq: async req => {
            
            const {token = ""} = req.body

            return Helpers.verifyToken(token)
        },

        sendFetchedData: res => ({err, data}) => {
            res.locals.response.error = err
            res.locals.response.data = data
            res.send(res.locals.response)    
        },

        createToken: id => {
            
            const payload = {
                id,
                mysecretket: "foo bar hello world"
            }

            return jwt.sign(

                payload,

                ServerParameters.TOKEN_SECRET,

                {
                    expiresIn: 3600 * 24
                }
            )
        }
    }

    const Middleware = {
        needAuth: async (req, res, next) => {

            const decodedToken = await Helpers.getTokenFromReq(req)

            if(decodedToken && decodedToken.id){
                UserRepository.findById(decodedToken.id, {attributes: ['id']}).then(user => {
                    if(user){
                        req.token = decodedToken
                        return next()
                    } else {
                        res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
                        return res.send(res.locals.response)   
                    }
                })
            } else {
                res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
                return res.send(res.locals.response)    
            }

        }
    }

    router.post('/message/create', Middleware.needAuth, async (req, res) => {

        const decodedToken = req.token
        const {contactId, message} = req.body

        return MessageRepository.create(message.text, decodedToken.id, contactId).then(Helpers.sendFetchedData(res))

    })

    router.post('/talk/:contactId', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)
        // const decodedToken = {id: 1}

        const contactId = req.params.contactId

        if(decodedToken && decodedToken.id){
            return UserRepository.findById(decodedToken.id).then(user => {

                if(!user){
                    res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
                    return;
                }

                return ChatRepository.getChat(contactId, decodedToken.id).then(Helpers.sendFetchedData(res))
            })
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
            // return res.send(res.locals.response)    
        }  
        
        return res.send(res.locals.response) 
    })


    router.post('/discussions-contacts', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)

        // const decodedToken = {id: 1}
        
        if(decodedToken && decodedToken.id){
            return ChatRepository.findDiscussionsAndContacts(decodedToken.id).then(Helpers.sendFetchedData(res))
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
            return res.send(res.locals.response)    
        }    
    })

    router.post('/user', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)
        
        if(decodedToken && decodedToken.id){
            return UserRepository.getInfo(decodedToken.id).then(user => {

                if(user){
                    res.locals.response.data.user = user.get()
                    res.send(res.locals.response)
                } else {
                    res.locals.response.error = ServerParameters.API_ERROR.USER_NOT_FOUND
                    res.send(res.locals.response)
                }
            })
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
            return res.send(res.locals.response)    
        }
    })

    router.post('/login', async (req, res) => {

        const {username, password} = req.body

        return UserRepository.login(username, password).then(userFound => {

            if(userFound){
                res.locals.response.data['token'] = Helpers.createToken(userFound.id)
            } else {
                res.locals.response.error = ServerParameters.API_ERROR.USER_NOT_FOUND
            }

            res.send(res.locals.response)    
        })

    })


    router.post('/authenticate', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)

        console.log({decodedToken})

        if(decodedToken){
            return UserRepository.findById(decodedToken.id || null).then(user => {
                res.locals.response.data.access = user !== null
                res.send(res.locals.response)
            })
        } else {
            res.locals.response.data.access = false
            return res.send(res.locals.response)
        }

    })


    return router

}