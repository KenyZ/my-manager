
module.exports = (sequelize, Datatypes) => {

    const Op = require('sequelize').Op
    const {API_ERROR} = require('../utils/ServerParameters')
    const Chat = sequelize.import('./Chat.js')

    const User = sequelize.define('User', {

        login: {
            type: Datatypes.STRING,
            allowNull: false,
        },

        password: {
            type: Datatypes.STRING,
            allowNull: false,
        },

        username: {
            type: Datatypes.STRING,
            allowNull: false,
        },


        avatar: {
            type: Datatypes.STRING,
            allowNull: false,
        },

        is_connected: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }

    }, {
        timestamps: false,
        tableName: 'users',
        name: {
            singular: 'user',
            plural: 'users'
        }
    })


    const UserUtils = {
        getUser(user){
            return {
                id: user.get('id'),
                username: user.get('username'),
                avatar: user.get('avatar'),
                is_connected: user.get('is_connected'),
            }
        }
    }


    User.createUser = async function(login, password, username, avatar, is_connected = false){
        return this.create({
            login,
            password,
            username,
            avatar,
            is_connected
        })
    }

    User.login = async function(login, password){

        let user = null

        try {
            user = await this.findOne({
                where: {login, password}
            })
        } catch (UserLoginError) {
            console.log({UserLoginError})
        }

        return user
    }

    User.getInfo = async function(id){

        let user = null

        try {
            user = await this.findByPk(id, {
                attributes: ['username', 'avatar', 'id']
            })

            user = user.get()
        } catch (UserGetInfoError) {
            console.log({UserGetInfoError})
        }

        return user
    }

    User.getByPk = async function(id, attributes){
        
        let user = null

        try {
            user = await this.findByPk(id, {
                attributes: attributes
            })
        } catch (UserGetByPkError) {
            console.log({UserGetByPkError})
        }

        return user
    }


    User.getChatsAndContacts = async function(id){
        
        let user = null

        try {
            user = await this.findByPk(id, {
                
                attributes: [],

                order: [
                    ['contacts'/** just specify association ?? wtf ??? */, 'username', 'ASC']
                ],
                
                include: [
                    {
                        association: 'contacts',
                        attributes: ['id', 'username', 'avatar', 'is_connected'],
                    },
                    {
                        attributes: ['id'],
                        association: 'discussions',
                        include: [
                            {
                                association: 'messages',
                                attributes: ['id', 'text', 'created_at', 'author_id'],
                                separate: true,
                                limit: 1,
                                order: [
                                    ['created_at', 'DESC']
                                ],
                                include: [
                                    {
                                        association: 'author',
                                        attributes: ['id', 'username', 'avatar', 'is_connected']
                                    }
                                ]
                            },
                            {
                                association: 'participants',
                                attributes: ['id', 'username', 'avatar', 'is_connected'],
                                where: {
                                    id: {
                                        [Op.ne]: id
                                    }
                                }
                            }
                        ]
                    }
                ]
            })

            user = {
                contacts: user.contacts.map(contactsItem => UserUtils.getUser(contactsItem)),
                discussions: user.discussions.map(discussionsItem => ({
                    id: discussionsItem.id,
                    is_group: discussionsItem.participants.length > 1,
                    participants: discussionsItem.participants.map(participantsItem => UserUtils.getUser(participantsItem)),
                    last_message: discussionsItem.messages && discussionsItem.messages.length > 0 ? discussionsItem.messages[0] : null
                }))
            }
        } catch (UserChatContactsError) {
            console.log({UserChatContactsError})
        }

        return user
    }

    User.getChat = async function(selfId, contactId, safe = false){

        const response = {
            data: null,
            error: false
        }


        const chatId = /^\d+$/.test(contactId) ? contactId : false

        /**
         * 
         * 
         * !!!!!!!!
         * CAN BE USERNAME OR CHAT ID
         * !!!!!!
         */

        if(safe){
            if(chatId){
                
            } else {
                let contact = await this.findOne({where: {username: contactId}, attributes: ['id']})

                if(!contact){
                    console.log("a")
                    response.error = API_ERROR.USER_NOT_FOUND
                    return response
                }
            }
        }

        let userWithChat = null
        
        try {
            if(chatId){ // get by chat id
                userWithChat = await this.findByPk(selfId, {
                
                    attributes: ["id", "username", "avatar"],
    
                    include: [
                        {
                            association: 'discussions',
                            attributes: ['id'],
                            required: false,
                            where: {
                                id: chatId
                            },
                            include: [
                                {
                                    association: 'participants',
                                    attributes: ['id', 'username', 'avatar']
                                },
                                {
                                    association: 'messages',
                                    attributes: ['id', 'text', 'created_at', 'author_id'],
                                    separate: true,
                                    limit: 50,
                                    order: [
                                        ['created_at', 'DESC']
                                    ],
                                    include: [
                                        {
                                            association: 'author',
                                            attributes: ['id', 'username', 'avatar']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                    
                })
            } else {
                userWithChat = await this.findByPk(selfId, {
                
                    attributes: ["id", "username", "avatar"],
    
                    include: [
                        {
                            association: 'discussions',
                            attributes: ['id'],
                            include: [
                                {
                                    association: 'participants',
                                    attributes: ['id', 'username', 'avatar'],
                                    where: {
                                        username: contactId
                                    }
                                },
                                {
                                    association: 'messages',
                                    attributes: ['id', 'text', 'created_at', 'author_id'],
                                    separate: true,
                                    limit: 50,
                                    order: [
                                        ['created_at', 'DESC']
                                    ],
                                    include: [
                                        {
                                            association: 'author',
                                            attributes: ['id', 'username', 'avatar']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                    
                })
            }

            if(!userWithChat){ // USER DOES NOT EXISTS
                response.error = API_ERROR.USER_NOT_FOUND
                return response
            }

            if(userWithChat && userWithChat.get('discussions').length > 0){

                let _discussion = userWithChat.get('discussions')[0]

                userWithChat = {
                    self: {
                        id: userWithChat.get('id'),
                        username: userWithChat.get('username'),
                        avatar: userWithChat.get('avatar'),
                    },
                    id: _discussion.get('id'),
                    participants: _discussion.get('participants').map(participantsItem => ({
                        id: participantsItem.id,
                        username: participantsItem.username,
                        avatar: participantsItem.avatar,
                    })),
                    messages: _discussion.get('messages').map(messagesItem => ({
                        id: messagesItem.id,
                        text: messagesItem.text,
                        author: messagesItem.author,
                        author_id: messagesItem.author_id,
                        created_at: messagesItem.created_at,
                    }))
                }
            } 
            else { // NO DISCUSSION -> CREATE

                if(chatId){
                    response.error = API_ERROR.CHAT_NOT_FOUND
                    return response                }
                else { // dont create the chat if its get chat by chat id
                    const selfModel = await this.findByPk(selfId)
                    const contactModel = await this.findOne({where: {username: contactId}, attributes: ['id']})

                    const createdChat = await Chat.createChat([
                        selfModel,
                        contactModel
                    ])

                    const finallyChat = await User.getChat(selfId, contactId)

                    return finallyChat 
                }
            }





            // WHEN SELF DONT EXIST

            // WHEN CONTACT IS NOT CONTACT

            // WHEN DISCUSSION DOENS EXIST

            // CREATE RESPONSE PATTERN {data, error}


            response.data = {
                chat: userWithChat
            }

        } catch (UserGetChatError) {
            console.log({UserGetChatError})
        }



        return response

    }

    User.findByUsername = async function(selfId, username){

        let users = []

        try {

            let selfContactsId = await (await this.findByPk(selfId, {attributes: ['id']})).getContacts().map(s => s.get('id'))

            users = await this.findAll({
                attributes: ['id', 'username', 'avatar'],
                where: {
                    username: {
                        [Op.substring]: username,
                    },
                    id: {
                        [Op.ne]: selfId,
                        [Op.notIn]: selfContactsId
                    }
                },
                // limit: 10,
                order: [
                    ['username', 'ASC']
                ]
            })
        } catch (FindUserByUsernameError) {
            console.log({FindUserByUsernameError})
        }

        return users
    }

    User.addContact = async function(selfId, contactId){

        try {

            let self = await this.findByPk(selfId, {attributes: ['id']})
            let contact = await this.findByPk(contactId, {attributes: ['id', 'username', 'avatar']})

            if(self && contact){
                newContact = await self.addContact(contact)
                return contact
            } else {
                return null
            }

        } catch (UserAddNewContactError) {
            console.log({UserAddNewContactError})
            return null
        }
    }


    User.setStatus = async function(selfId = null, status = false){
        return this.update({
            is_connected: status
        }, {
            where: {
                id: selfId
            }
        })
    }

    User.fetchContacts = async function(selfId){
        let selfWithContacts = null
        
        try {
            selfWithContacts = this.findByPk(selfId, {

                attributes: ['id'],

                include: [{
                    association: 'contacts',
                    attributes: ['id'],
                    where: {
                        is_connected: true
                    }
                }]
            })

            selfWithContacts = selfWithContacts.get('contacts').map(contactsItems => {
                return {
                    id: contactsItems.get('id'),
                }
            })

        } catch (TryFetchContactError) {
            console.log({TryFetchContactError})
        }

        return selfWithContacts
        
    }

    return User
}