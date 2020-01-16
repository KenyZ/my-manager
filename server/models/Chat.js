
module.exports = (sequelize, Datatypes) => {

    const {API_ERROR} = require('../utils/ServerParameters')
    const Op = require('sequelize').Op

    const Chat = sequelize.define('Chat', {

    }, {
        timestamps: false,
        tableName: 'chats',
        name: {
            singular: 'chat',
            plural: 'chats'
        }
    })

    Chat.createChat = async function(participants){
        return this.create({

        }).then(createdChat => {
            return createdChat.setParticipants(participants).then(addedParticipants => createdChat)
        })
    }

    Chat.getAvailableParticipants = async function(chat_id, self_id){

        const response = {
            error: false,
            data: null
        }

        
        try {
            let chatWithParticipants = await this.findByPk(chat_id, {
                attributes: ['id'],
                include: [
                    {
                        association: 'participants',
                        attributes: ['id'],
                        where: {
                            is_connected: true,
                            // id: {
                            //     [Op.ne]: self_id
                            // }
                        }
                    }
                ]
            })

            if(chatWithParticipants){
                response.data = chatWithParticipants.get('participants').map(participant => ({
                    id: participant.get('id'),
                }))
            } else {
                response.error = API_ERROR.CHAT_NOT_FOUND
                return response
            }

        } catch (GettingParticipantsError) {
            response.error = GettingParticipantsError
            console.log({GettingParticipantsError})
        }


        return response
    }

    return Chat
}