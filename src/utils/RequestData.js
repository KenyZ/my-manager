
import Utils from './Utils'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import xss from 'xss'
import StorageManager from './StorageManager'

const RequestDataUtils = {
    checkToken: async token => {

        const decodedToken = jwt.decode(token)
        
        if(decodedToken && decodedToken.exp){
            return !(decodedToken.exp < Date.now() / 1000) // isExpired
        }

        return false
    }
}

const RequestData = {


    getChat(chatId){
        return Utils.requestApi('/chat/' + xss(chatId), {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                throw response.body.error
            }

            const returnedData = response.body.data.chat

            if(returnedData && returnedData.messages){

                const interlocutor = returnedData.self

                returnedData.messages = returnedData.messages.reverse().map(message => {

                    return {
                        ...message,
                        createdAt: Utils.getDate(message.created_at),
                        isReceived: interlocutor.id !== message.author_id
                    }
                })
            }


            return {
                ...returnedData,
                contact: returnedData.participants[0]
            }
        })
    },


    createMessage(text, chatId){

        return Utils.requestApi('/message', {
            method: 'put',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            },
            body: {
                message_text: text,
                chat_id: chatId
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            let message = response.body.data.message

            message = {
                ...message,
                createdAt: Utils.getDate(message.created_at),
                isReceived: false
            }

            return message
        })
    },


    login(form){

        return Utils.requestApi('/login', {
            body: form
        })
        .then(response => {

            if(response.body.error){
                throw response.body.error
            }

            if(response.body.data && response.body.data.token){
                return response.body.data
            } else {
                return false
            }
        })
    },

    checkAuthentication(){
        return Utils.requestApi('/authenticate', {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            },
        }).then(response => ( (response.body.data && response.body.data.access) && response.body.data.access) )
    },


    findUsers(username){
        return Utils.requestApi('/user?username=' + xss(username), {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            },
        }).then(response => {
            
            if(response.body.error){
                return
            }

            let foundUsers = response.body.data.users
            return foundUsers
        })
    },

    addNewContact(contactId){
        return Utils.requestApi('/contact?add=' + xss(contactId), {
            method: 'put',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            },
        }).then(response => {
            
            if(response.body.error){
                return null
            }

            return response.body.data.user
        }) 
    }

}

export default RequestData