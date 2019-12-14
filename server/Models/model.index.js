


module.exports = (sequelize, DataTypes) => {
    const modelFiles = {
        User: require('./model.user'),
        Chat: require('./model.chat'),
        Participant: require('./model.participant'),
        // Contact: require('./ContactModel'),
        Message: require('./model.message'),
    }
    
    const models = {}
    
    for(let modelName in modelFiles){
        models[modelName] = modelFiles[modelName](sequelize, DataTypes)
    }

    const {User, Message, Chat, Participant} = models

    Message.belongsTo(User, {as: 'author'})
    Message.belongsTo(Chat)
    
    Chat.Messages = Chat.hasMany(Message)

    Chat.User = Chat.belongsToMany(User, {through: Participant, as: 'participants'})
    User.Chat = User.belongsToMany(Chat, {through: Participant, as: 'discussions'})

    // Chat.Participants = Chat.belongsToMany(User, {as: 'participants', through: 'Participants'})
    // User.Discussions = User.belongsToMany(Chat, {as: 'discussions', through: 'Participants'})

    User.Contacts = User.belongsToMany(User, {as: 'contacts', through: 'Contacts', foreignKey: 'selfId', otherKey: 'contactId'})
    User.hasMany(Message)
    
    return models
}