
module.exports = (sequelize, Datatypes) => {

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

    Message.createMessage = async function(author_id, chat_id, text, createdAt = undefined){
        
        const response = {
            data: null,
            error: false
        }

        let message = null
        
        try {
            message = await this.create({
                text,
                chat_id,
                author_id,
                created_at: createdAt
            })


            if(message){

                let createdMessage = await this.findByPk(message.get('id'), {
                    attributes: ['id', 'text', 'created_at', 'author_id'],
                    include: [
                        {
                            association: 'author',
                            attributes: ['id', 'username', 'avatar']
                        }
                    ]
                })

                response.data = {
                    message: createdMessage.get()
                }

            }

            
        } catch (CreateMessageError) {
            console.log({CreateMessageError})
        }

        return response
    }

    return Message
}