
const Sequelize = require('sequelize')
const notEqualOperator = Sequelize.Op.ne
const containsOperator = Sequelize.Op.contains

const ServerConstants = require('../../ServerConstants')
const RepositoryHelper = require('./RepositoryHelper')

module.exports = (database, models) => {

    const {Chat, User, Message} = models

    return {

        // test: () => {

        //     const userId = 1

        //     return User.findByPk(userId, {
              
        //         attributes: ['id'],

        //         order: [
        //             [{model: Chat, as: 'discussions'}, {model: Message}, 'createdAt', 'DESC']
        //         ],

        //         /// HERE HERE HERE HEREE

        //         include: [
        //             {
        //                 model: Chat,
        //                 as: 'discussions',
        //                 subQuery: true,
        //                 include: [
        //                     {
        //                         model: Message,
        //                         attributes: ['id', 'text', 'createdAt'],
        //                         limit: [1]
        //                     }
        //                     // {
        //                     //     association: Chat.User,
        //                     //     as: 'participants',

        //                     // }
        //                 ]
        //             }
        //         ]
                
        //     })
        // },

        getChat: (contactId, thisUserId) => {

            return User.findByPk(contactId, {
                attributes: ['id', 'username', 'avatar'],
                order: [
                    [{model: Chat, as: 'discussions'}, Message, 'createdAt', 'ASC']
                ],
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
                                    id: thisUserId
                                }
                            },

                            {
                                model: Message,
                                attributes: ['id', 'text', 'createdAt'],
                                include: [
                                    {
                                        model: User,
                                        as: 'author',
                                        attributes: ['id', 'username', 'avatar']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }).then(user => {

                const returnedData = {
                    err: false,
                    data: null
                }

                if(!user){
                    returnedData.err = ServerConstants.API_ERROR.USER_NOT_FOUND
                    return returnedData
                }
                
                let _discussions = user.get('discussions')
                const hasDiscussion = _discussions.length > 0
                
                returnedData.data = {                    
                    chat: {
                        hasDiscussion,
                        id: hasDiscussion && _discussions[0].get('id'),
                        messages: hasDiscussion ? _discussions[0].get('messages').map(m => RepositoryHelper.retrieveMessage(m)) : [],

                        contact: {
                            id: user.get('id'),
                            username: user.get('username'),
                            avatar: user.get('avatar'),
                        },

                    }
                }


                return returnedData
            })
        },

        findDiscussionsAndContacts: (userId = -1) => {

            const returnedData = {
                err: false,
                data: null
            }

            return User.findByPk(userId, {

                attributes: [],

                order: [
                    [User.Contacts, 'username', 'ASC'],
                ],

                include: [
                    {
                        association: User.Contacts,
                        as: 'contacts',
                        attributes: ['id', 'username', 'avatar'],
                        include: [
                            {
                                model: Chat,
                                as: 'discussions',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: User,
                                        as: 'participants',
                                        attributes: [],
                                        where: {
                                            id: userId
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: Chat,
                        as: 'discussions',
                        attributes: ['id'],
                        order: [
                            ['createdAt', 'DESC'],
                        ],
                        include: [
                            {
                                model: User,
                                as: 'participants',
                                attributes: ['id', 'avatar', 'username'],
                                where: {
                                    id: {
                                        [notEqualOperator]: userId
                                    }
                                },
                            }
                        ]
                    }
                ]
            })
            .then(user => {
                if(!user){
                    return false
                }
                
                const discussions = user.get('discussions')

                return Promise.all(
                    discussions.map(d => {

                        return Message.findAll({
                            attributes: ['id', 'text', 'createdAt'],
                            where: {chatId: d.get('id')},
                            order: [
                                ['createdAt', 'DESC']
                            ],
                            limit: 1,
                            include: [
                                {
                                    model: User,
                                    as: 'author',
                                    attributes: ['id', 'avatar', 'username']
                                }
                            ]
                        }).then(messages => {
                            return {
                                chat: d.get('id'),
                                messages: messages
                            }
                        })
                    })
                ).then(messages => {

                    const gatherDiscussions = discussions.map(d => {

                        const {messages: thisMessages} = messages.find(m => m.chat === d.get('id'))
                        const lastMessage = thisMessages.length === 0 ? null : thisMessages[0]
                        
                        return {
                            id: d.get('id'),
                            participants: d.get('participants').map(p => RepositoryHelper.retrieveUser(p)),
                            lastMessage: lastMessage,
                        }
                    })  

                    returnedData.data = {
                        chats: gatherDiscussions,
                        contacts: user.get('contacts').map(c => RepositoryHelper.retrieveUser(c))
                    }

                    return returnedData

                })
                
            })
        },

    }

}
