
module.exports = (sequelize, Datatypes) => {

    const User = sequelize.import('./User.js')
    const Chat = sequelize.import('./Chat.js')
    const {API_ERROR} = require('../utils/ServerParameters')

    const Message = sequelize.define('Message', {
        text: {
            type: Datatypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'created_at',
        tableName: 'messages',
        name: {
            singular: 'message',
            plural: 'messages'
        }
    })

    Message.createMessage = async function(author_id, chat_id, text, createdAt = undefined, safe = false){
        
        const response = {
            data: null,
            error: false
        }

        let message = null


        if(safe){
            let author = await User.findByPk(author_id, {attributes: ['id']})
            let chat = await Chat.findByPk(chat_id, {attributes: ['id']})

            if(!chat || !author){
                response.error = API_ERROR.INVALID_QUERY
                return response
            }
        }
        
        try {
            message = await this.create({
                text,
                chat_id,
                author_id,
                created_at: createdAt
            })


            if(message){

                let createdMessage = await this.findByPk(message.get('id'), {
                    attributes: ['id', 'text', 'created_at', 'author_id', 'chat_id'],
                    include: [
                        {
                            association: 'author',
                            attributes: ['id', 'username', 'avatar']
                        }
                    ]
                })

                response.data = createdMessage.get()

            }

            
        } catch (CreateMessageError) {
            console.log({CreateMessageError})
        }

        return response
    }

    return Message
}