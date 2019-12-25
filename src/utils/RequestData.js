
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

    getUserInfo(){
        return Utils.requestApi('/user?info=43', {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const user = response.body.data.user

            return user
        })
    },

    getDiscussionsAndContacts(){
        return Utils.requestApi('/user?chats&contacts', {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            let chats = response.body.data.discussions.map(chat => {

                return {
                    ...chat,
                    lastMessage: chat.last_message ? {
                        ...chat.last_message,
                        createdAt: Utils.getDate(chat.last_message.created_at),
                    } : null
                }
            })
            .sort((a, b) => {

                return (!a.lastMessage || !b.lastMessage) ? 0 :  b.lastMessage.createdAt.date.diff(a.lastMessage.createdAt.date)
            })
            // .sort((a, b) => {

            //     [a, b] = [a.lastMessage, b.lastMessage]

            //     let diff = b.createdAt.date.diff(a.createdAt.date, 'days', true)
            //     if(diff > 0) return 1
            //     else if (diff < 0) return -1
            //     else return 0
            // })

            const contacts = response.body.data.contacts
            return {chats, contacts}
        })
    },

    getChat(contactId){
        return Utils.requestApi('/chat?contact_id=' + contactId, {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const returnedData = response.body.data.chat

            if(returnedData && returnedData.messages){

                const interlocutor = returnedData.participants[0]

                returnedData.messages = returnedData.messages.reverse().map(message => {

                    return {
                        ...message,
                        createdAt: Utils.getDate(message.created_at),
                        isReceived: interlocutor.id === message.author_id
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
                console.log({a: response.body.error})
                throw new Error(response.body.error)
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