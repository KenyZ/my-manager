const Sequelize = require('sequelize')

const RepositoryHelper = require('./RepositoryHelper')


module.exports = (database, models) => {

    const {Message, User, Chat} = models

    return {

        create(text, authorId, contactId){


            return User.findByPk(contactId, {
                attributes: ['id'],

                include: [
                    {
                        model: Chat,
                        as: 'discussions',
                        attributes: ['id'],
                        include: [
                            {
                                association: Chat.User,
                                as: 'participants',
                                attributes: [],
                                where: {
                                    id: authorId
                                }
                            }
                        ]
                    }
                ]
            }).then(user => {

                const returnedData = {
                    err: false,
                    data: null
                }

                const discussions = user.get('discussions')
                if(discussions && discussions.length > 0){

                    const chatId = discussions[0].get('id')

                    return Message.create({
                        text
                    }).then(createdMessage => {

                        return Promise.all([
                            User.findByPk(authorId, {attributes: ['id']}),
                            Chat.findByPk(chatId, {attributes: ['id']}),
                        ]).then(([author, chat]) => {
                            return Promise.all([
                                createdMessage.setAuthor(author),
                                createdMessage.setChat(chat)
                            ]).then(() => createdMessage.get('id'))
                        }).then(() => {
                            return Message.findByPk(createdMessage.get('id'), {
                                attributes: ['id', 'text', 'createdAt'],
                                include: [
                                    {
                                        model: User,
                                        as: 'author',
                                        attributes: ['id', 'username', 'avatar']
                                    }
                                ]
                            }).then(finalMessage => {
                                
                                returnedData.data = {
                                    message: RepositoryHelper.retrieveMessage(finalMessage)
                                }

                                return returnedData
                            })
                        })
                    })
                } else {
                    console.log('there is no discussion')
                    return Promise.all([
                        User.findByPk(authorId, {attributes: ['id']}),
                        User.findByPk(contactId, {attributes: ['id']}),
                    ]).then(([author, contact]) => {
                        return Chat.create().then(createdChat => {
                            console.log('gere')

                            return Promise.all([
                                createdChat.setParticipants([author, contact]),
                                Message.create({text}).then(createdMessage => {
                                    console.log('aaa')

                                    return Promise.all([
                                        createdChat.addMessage(createdMessage),
                                        createdMessage.setAuthor(author)
                                    ]).then(() => createdMessage.get('id'))
                                })
                            ])
                            .then(([_, createdMessageId]) => {

                                return Message.findByPk(createdMessageId, {
                                    attributes: ['id', 'text', 'createdAt'],
                                    include: [
                                        {
                                            model: User,
                                            as: 'author',
                                            attributes: ['id', 'username', 'avatar']
                                        }
                                    ]
                                }).then(finalMessage => {
                                    
                                    returnedData.data = {
                                        message: RepositoryHelper.retrieveMessage(finalMessage)
                                    }
    
                                    return returnedData
                                })
                            })
                        })
                    })
                }

            })
        }
    }

}