
module.exports = (sequelize, Datatypes) => {

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

    return Chat
}