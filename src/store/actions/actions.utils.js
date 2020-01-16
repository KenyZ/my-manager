
import Utils from '../../utils/Utils'

export default {

    formatMessage: (message, interlocutor) => {
        return {
            ...message,
            createdAt: Utils.getDate(message.created_at),
            isReceived: interlocutor.id !== message.author_id
        }
    }

}