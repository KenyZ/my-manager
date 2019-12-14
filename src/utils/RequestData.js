
import Utils from './Utils'
import moment from 'moment'
import jwt from 'jsonwebtoken'

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

    getUserInfo(token){
        return Utils.requestApi('user', {
            body: {
                token: token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const user = response.body.data.user

            return user
        })
    },

    getDiscussionsAndContacts(token){
        return Utils.requestApi('discussions-contacts', {
            body: {
                token: token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const chats = response.body.data.chats.map(d => {

                return {
                    ...d,
                    lastMessage: {
                        ...d.lastMessage,
                        createdAt: Utils.getDate(d.lastMessage.createdAt),
                    }
                }
            })
            .sort((a, b) => {

                [a, b] = [a.lastMessage, b.lastMessage]

                let diff = b.createdAt.date.diff(a.createdAt.date, 'days', true)
                if(diff > 0) return 1
                else if (diff < 0) return -1
                else return 0
            })

            const contacts = response.body.data.contacts
            return {chats, contacts}
        })
    },

    getChat(chatID, token){
        return Utils.requestApi('talk/' + chatID, {
            body: {
                token: token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const returnedData = response.body.data.chat

            if(returnedData && returnedData.messages){

                const interlocutor = returnedData.contact

                returnedData.messages = returnedData.messages.map(message => {
                    return {
                        ...message,
                        createdAt: Utils.getDate(message.createdAt),
                        isReceived: interlocutor.id === message.author.id
                    }
                })
            }


            return returnedData
        })
    },


    createMessage(token, text, contactId){

        return Utils.requestApi('message/create', {
            body: {
                token: token,
                message: {
                    text
                },
                contactId: contactId
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            let message = response.body.data.message

            message = {
                ...message,
                createdAt: Utils.getDate(message.createdAt),
                isReceived: false
            }

            return message
        })
    },


    login(form){

        return Utils.requestApi('login', {
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

    checkAuthentication(token){
        return Utils.requestApi('authenticate', {
            body: {
                token
            }
        }).then(response => ( (response.body.data && response.body.data.access) && response.body.data.access) )
    }

}

export default RequestData