import StorageManager from '../../utils/StorageManager'
import * as ActionTypes from './actions.types'
import Utils from '../../utils/Utils'
import ActionUtils from './actions.utils'

import xss from 'xss'

export const addContact = contact => {
    return {
        type: ActionTypes.ADD_CONTACT,
        contact
    }
}


export const setChats = (chats = []) => {
    return {
        type: ActionTypes.SET_CHATS,
        chats
    }
}

export const setContacts = contacts => {
    return {
        type: ActionTypes.SET_CONTACTS,
        contacts
    }
}

export const setChat = chat => {
    return {
        type: ActionTypes.SET_CHAT,
        chat
    }
}

export const setMessages = (messages = null) => {
    return {
        type: ActionTypes.SET_MESSAGES,
        messages
    }
}

export const sendMessage = (chat_related_id, message = {text: ""}) => {

    console.log('will send message  | from action')
    return dispatch => {
        
        return 0
    }
}

export const getDiscussionsAndChatsAction = () => {
    return dispatch => {
        return Utils.requestApi('/user?chats&contacts', {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            let chats = response.body.data.discussions.map(chat => {

                return {
                    ...chat,
                    last_message: !chat.last_message ? null : ({
                        ...chat.last_message,
                        createdAt: Utils.getDate(chat.last_message.created_at),
                    })
                }
            })
            .sort((a, b) => {
                return (!a.lastMessage || !b.lastMessage) ? 0 :  b.lastMessage.createdAt.date.diff(a.lastMessage.createdAt.date)
            })

            const contacts = response.body.data.contacts
            return {chats, contacts}
        }).then(response => {

            if(response.chats && response.contacts){
                dispatch(setContacts(response.contacts))
                dispatch(setChats(response.chats))
            } else {
                console.error("getDiscussionsAndChatsAction failed")
            }
        })
    }
}


export const getChatAction = (chat_id = null) => {

    return dispatch => {

        return Utils.requestApi('/chat/' + xss(chat_id), {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                throw response.body.error
            }
            // @WIP il faut formatter les données dans tous les actionCreator | ici pour setChat
            const returnedData = response.body.data.chat

            if(returnedData && returnedData.messages){

                const interlocutor = returnedData.self

                // @OPTI should not .reverse() in front-end ?
                returnedData.messages = returnedData.messages.reverse().map(message => ActionUtils.formatMessage(message, interlocutor))
            }


            return {
                ...returnedData,
                contact: returnedData.participants[0]
            }

        }).then(retunedChat => {
            dispatch(setChat(retunedChat))
            return retunedChat
        })
    }
}

export const addMessage = message => {
    return {
        type: ActionTypes.ADD_MESSAGE,
        message
    }
}