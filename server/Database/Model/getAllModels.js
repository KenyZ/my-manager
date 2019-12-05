


module.exports = (DatabaseInstance, DataTypes) => {
    const modelFiles = {
        User: require('./UserModel'),
        Chat: require('./ChatModel'),
        Participant: require('./ParticipantModel'),
        Message: require('./MessageModel'),
    }
    
    const models = {}
    
    for(let modelName in modelFiles){
        models[modelName] = modelFiles[modelName](DatabaseInstance, DataTypes)
    }

    const {User, Message, Chat, Participant} = models

    Message.belongsTo(User, {as: 'author'})
    // Message.belongsTo(User, {as: 'target'})
    Message.belongsTo(Chat)
    
    Chat.Messages = Chat.hasMany(Message)
    // Chat.hasMany(Participant, {as: 'participants'})

    Chat.User = Chat.belongsToMany(User, {through: Participant, as: 'participants'})
    User.Chat = User.belongsToMany(Chat, {through: Participant, as: 'discussions'})

    return models
}