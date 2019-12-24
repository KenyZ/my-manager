
module.exports = (sequelize, Datatypes) => {

    const UserChat = sequelize.define('UserChat', {

    }, {
        timestamps: false,
        tableName: 'user_chats',
        name: {
            singular: 'user_chat',
            plural: 'user_chats'
        }
    })

    return UserChat
}