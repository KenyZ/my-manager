
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
                        date: moment(Utils.getDiffDate(message.createdAt))
                    },
                    isReceived: interlocutor.id === message.author.id
                }
            })

            

            chat.messages = Utils.linkBy(chat.messages, (c, p) => {

                let diffHours = Math.abs(c.createdAt.date.diff(p.createdAt.date))

                return c.isReceived === p.isReceived && diffHours < 2
            })

            // chat.messages = chat.messages.map(message => {

            //     return {
            //         ...message,
            //         createdAt: Utils.getDiffDate(message.createdAt),
            //     }
            // })

            console.log(chat.messages)

            return chat
        })
    },

}

export default RequestData