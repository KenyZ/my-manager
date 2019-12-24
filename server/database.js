
const sequelize = require('./sequelize')

const User = sequelize.import('./models/User.js'),
      Chat = sequelize.import('./models/Chat.js'),
      Message = sequelize.import('./models/Message.js'),
      UserChat = sequelize.import('./models/UserChat.js'),
      UserContact = sequelize.import('./models/UserContact.js')



/**
 * DEFINING MODELS RELATIONS
 */

// participants in chat
Chat.belongsToMany(User, {through: UserChat, as: 'participants', foreignKey: 'chat_id', otherKey: 'user_id', onDelete: 'CASCADE'})
User.belongsToMany(Chat, {through: UserChat, as: 'discussions', otherKey: 'chat_id', foreignKey: 'user_id', onDelete: 'CASCADE'})

// messages in chat
Chat.hasMany(Message, {as: 'messages', foreignKey: 'chat_id'})
Message.belongsTo(Chat, {foreignKey: 'chat_id'})

// User's messages
User.hasMany(Message, {as: 'author', foreignKey: 'author_id'})
Message.belongsTo(User, {as: 'author', foreignKey: 'author_id'})

// User's contact
User.belongsToMany(User, {through: UserContact, as: 'contacts', foreignKey: 'user_id', otherKey: 'contact_id', onDelete: 'CASCADE'})

module.exports = {
    sequelize,
    User, Chat, Message,

    UserChat, UserContact
}