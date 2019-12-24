
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

    }, {
        timestamps: false,
        tableName: 'users',
        name: {
            singular: 'user',
            plural: 'users'
        }
    })


    User.createUser = async function(login, password, username, avatar){
        return this.create({
            login,
            password,
            username,
            avatar
        })
    }

    User.login = async function(username, password){

        let user = null

        try {
            user = await this.findOne({
                where: {username, password}
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
                attributes: ['username', 'avatar']
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
                
                include: [
                    {
                        association: 'contacts',
                        attributes: ['id', 'username', 'avatar']
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
                                    ['created_at', 'ASC']
                                ],
                                include: [
                                    {
                                        association: 'author',
                                        attributes: ['id', 'username', 'avatar']
                                    }
                                ]
                            },
                            {
                                association: 'participants',
                                attributes: ['id', 'username', 'avatar'],
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
                contacts: user.contacts.map(contactsItem => ({
                    id: contactsItem.id,
                    username: contactsItem.username,
                    avatar: contactsItem.avatar,
                })),
                discussions: user.discussions.map(discussionsItem => ({
                    id: discussionsItem.id,
                    participants: discussionsItem.participants.map(participantsItem => ({
                        id: participantsItem.id,
                        username: participantsItem.username,
                        avatar: participantsItem.avatar,
                    })),
                    last_message: discussionsItem.messages && discussionsItem.messages.length > 0 ? discussionsItem.messages[0] : null
                }))
            }
        } catch (UserChatContactsError) {
            console.log({UserChatContactsError})
        }

        return user
    }

    User.getChat = async function(selfId, contactId){

        const response = {
            data: null,
            error: false
        }

        let userWithChat = null
        
        try {
            userWithChat = await this.findByPk(selfId, {
                
                attributes: [],

                include: [
                    {
                        association: 'discussions',
                        attributes: ['id'],
                        include: [
                            {
                                association: 'participants',
                                attributes: ['id', 'username', 'avatar'],
                                where: {
                                    id: contactId
                                }
                            },
                            {
                                association: 'messages',
                                attributes: ['id', 'text', 'created_at', 'author_id'],
                                separate: true,
                                limit: 50,
                                order: [
                                    ['created_at', 'ASC']
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

            if(!userWithChat){ // USER DOES NOT EXISTS
                response.error = API_ERROR.USER_NOT_FOUND
                return response
            }

            if(userWithChat && userWithChat.get('discussions').length > 0){

                let _discussion = userWithChat.get('discussions')[0]

                userWithChat = {
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
                    }))
                }
            } 
            else { // NO DISCUSSION -> CREATE

                const selfModel = await this.findByPk(selfId)
                const contactModel = await this.findByPk(contactId)

                const createdChat = await Chat.createChat([
                    selfModel,
                    contactModel
                ])

                const finallyChat = await User.getChat(selfId, contactId)

                return finallyChat 
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

    return User
}