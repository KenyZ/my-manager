
import Utils from './Utils'
import moment from 'moment'

const RequestData = {

    getDiscussion(user){

    },

    getChat(chatID, token){
        return Utils.requestApi('chat/' + chatID, {
            body: {
                token: token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            let chat = response.body.data.chat
            const interlocutor = chat.participants[0]

            chat.messages = chat.messages.map(message => {
                return {
                    ...message,
                    createdAt: {
                        text: Utils.getDiffDate(message.createdAt),
                        date: moment(message.createdAt)
                    },
                    isReceived: interlocutor.id === message.author.id
                }
            })

            return chat
        })
    },


    createMessage(text, token, chat){

        return Utils.requestApi('message/create', {
            body: {
                token: token,
                message: {
                    text
                },
                chat: chat.id
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const interlocutor = chat.participants[0]
            let message = response.body.data.message

            message = {
                ...message,
                createdAt: {
                    text: Utils.getDiffDate(message.createdAt),
                    date: moment(message.createdAt)
                },
                isReceived: interlocutor.id === message.author.id
            }

            return message
        })
    }

}

export default RequestData