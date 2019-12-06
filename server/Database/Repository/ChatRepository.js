
const Sequelize = require('sequelize')
const notEqualOperator = Sequelize.Op.ne

module.exports = (database, models) => {

    const {Chat, User, Message, Participant} = models


    return {

        getChat: (chatId, thisUserId) => {
                        
            return Chat.findByPk(chatId, {
                attributes: ['id'],
                order: [
                    [Message, 'createdAt', 'ASC'],
                ],
                include: [
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
                    },
                    {
                        association: Chat.User,
                        as: 'participants',
                        attributes: ['id', 'avatar', 'username'],
                        where: {id: {
                            [notEqualOperator]: thisUserId
                        }}
                    }
                ]
            })
        },

        findAllDiscussionsOf: (userId = -1) => {


            return User.findByPk(userId, {

                attributes: [],

                include: [
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
                                }
                            }
                        ]
                    }
                ]
            }).then(user => {
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
                            participants: d.get('participants'),
                            lastMessage: lastMessage
                        }
                    })  

                    return gatherDiscussions

                })
                
            })
        },


        test(){
            return User.findByPk(1, {

                // logging: console.log,

                // order: [
                //     [User.Chat, Message, 'createdAt', 'DESC']
                // ],

                // include: [
                //     {
                //         association: User.Chat,
                //         separate: false,
                //         as: 'discussions',
                //         include: [
                //             {
                //                 model: Message,
                //                 limit: 2,
                //                 separate: true,
                //             }
                //         ]
                //     }
                // ]

            })
        }
    }

}
