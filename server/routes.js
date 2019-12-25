
const jwt = require('jsonwebtoken')
const ServerParameters = require('./utils/ServerParameters')

module.exports = (router, {
    User,
    Chat,
    Message
}) => {

    /**
     * HELPERS
     */
    const Helpers = {

        verifyToken: async token => {
            let decodedToken = jwt.decode(token, process.env.API_SECRET) || null

            if(decodedToken){
                try {
                    let verifiedToken = jwt.verify(token, process.env.API_SECRET)
                } catch (VerifyTokenError) {
                    // console.error({VerifyTokenError})
                    return false
                }
            } 

            return decodedToken
        },

        getTokenFromReq: async req => {
            
            const token = req.headers['x-auth-token'] || ""

            return Helpers.verifyToken(token)
        },

        sendFetchedData: res => ({err, data}) => {
            res.locals.response.error = err
            res.locals.response.data = data
            res.send(res.locals.response)    
        },

        createToken: id => {
            
            const payload = {
                id
            }

            return jwt.sign(

                payload,

                process.env.API_SECRET,

                {
                    expiresIn: 3600 * 24
                }
            )
        },

        updateAPIResponse: (res, data, error = false) => {
            res.locals.response.error = error
            if(data) {
                res.locals.response.data = Object.assign({}, res.locals.response.data, data)
            }
        }
    }

    const Middleware = {
        needAuth: async (req, res, next) => {

            const decodedToken = await Helpers.getTokenFromReq(req)

            if(decodedToken && decodedToken.id){

                let user = User.getByPk(decodedToken.id, ['id'])

                if(user){
                    req.token = decodedToken
                    return next()
                } else {
                    res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
                    return res.send(res.locals.response)   
                }
            } else {
                res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
                return res.send(res.locals.response)    
            }

        }
    }


    /**
     * INIT
     */
    const initApiResponse = (req, res, next) => {

        res.locals.response = {
            error: false,
            data: {}
        }

        next()
    }
      
    router.use(initApiResponse)


    /**
     * ROUTES
     */

    router.get('/', async (req, res) => {
        return res.send({ok: true})
    })

    router.post('/login', async (req, res) => {

        const {username, password} = req.body

        let user = await User.login(username, password)
        
        if(user && user.id){
            Helpers.updateAPIResponse(res, {
                token: Helpers.createToken(user.id)
            }, false)
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.USER_NOT_FOUND
        }

        return res.send(res.locals.response)   

    })

    router.get('/authenticate', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)

        if(decodedToken && decodedToken.id){

            let user = User.getByPk(decodedToken.id || null)
            Helpers.updateAPIResponse(res, {
                access: user !== null,
            }, false)
            return res.send(res.locals.response)
        } else {
            Helpers.updateAPIResponse(res, {
                access: false,
            }, false)
            return res.send(res.locals.response)
        }

    })

    router.get('/user/', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)

        // const decodedToken = {id: 1}
        
        if(decodedToken && decodedToken.id){


            if(typeof req.query.info !== "undefined"){ // GET INFO

                const user = await User.getInfo(decodedToken.id)
                
                if(user){
                    Object.assign(res.locals.response.data, {user})
                } else {
                    res.locals.response.error = ServerParameters.API_ERROR.USER_NOT_FOUND
                    return res.send(res.locals.response)
                }
            }

            if(typeof req.query.chats !== "undefined" && typeof req.query.contacts !== "undefined"){

                const chatsAndContacts = await User.getChatsAndContacts(decodedToken.id)

                if(chatsAndContacts){
                    Object.assign(res.locals.response.data, {
                        discussions: chatsAndContacts.discussions,
                        contacts: chatsAndContacts.contacts
                    })
                } else {
                    res.locals.response.error = ServerParameters.API_ERROR.USER_NOT_FOUND
                    return res.send(res.locals.response)
                }
            }

            if(typeof req.query.username !== "undefined"){
                const foundUsers = await User.findByUsername(decodedToken.id, req.query.username || null)
                Helpers.updateAPIResponse(res, {users: foundUsers}, false)
            }

            return res.send(res.locals.response)

        } else {
            res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
            return res.send(res.locals.response)    
        }    
    })

    
    router.get('/chat', async (req, res) => {

        const decodedToken = await Helpers.getTokenFromReq(req)
        // const decodedToken = {id: 1}

        const contactId = req.query.contact_id

        if(!contactId){
            res.locals.response.error = ServerParameters.API_ERROR.INVALID_QUERY
            return res.send(res.locals.response)
        }

        if(decodedToken && decodedToken.id){
            let {data, error} = await User.getChat(decodedToken.id, contactId, true)
            Helpers.updateAPIResponse(res, data, error)
            
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.MUST_BE_AUTH
        }  
        
        return res.send(res.locals.response) 
    })

    router.put('/message', Middleware.needAuth, async (req, res) => {

        const decodedToken = req.token
        const {chat_id, message_text} = req.body

        if(chat_id && message_text){
            const {data, error} = await Message.createMessage(decodedToken.id, chat_id, message_text, undefined, true)
            Helpers.updateAPIResponse(res, data, error)            
        }

        return res.send(res.locals.response) 
    })

    router.put('/contact', Middleware.needAuth, async (req, res) => {

        const decodedToken = req.token
        // const decodedToken = {id: 1}
        const newContactId = req.query.add

        if(newContactId){
            const addingContact = await User.addContact(decodedToken.id, newContactId)
            Helpers.updateAPIResponse(res, {user: addingContact})
        } else {
            res.locals.response.error = ServerParameters.API_ERROR.INVALID_QUERY
        }

        return res.send(res.locals.response)

    })

}