module.exports = (database, models) => {

    const {Message, User, Chat} = models

    return {

        create(text, authorID, chatID){

            return Message.create({
                text
            })
            .then(createdMessage => {

                return Promise.all([
                    User.findByPk(authorID),
                    Chat.findByPk(chatID),
                ]).then(([author, chat]) => {
                    return Promise.all([
                        createdMessage.setAuthor(author),
                        createdMessage.setChat(chat)
                    ]).then(() => createdMessage.get('id'))
                })
            })
            .then(createdMessageID => {
                return Message.findByPk(createdMessageID, {
                    attributes: ['id', 'text', 'createdAt'],
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'username', 'avatar']
                        }
                    ]
                })
            })
        }
    }

}