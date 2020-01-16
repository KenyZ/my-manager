import {combineReducers} from 'redux'

import Utils from '../utils/Utils'
import * as ActionTypes from './actions/actions.types'

const StoreData = {
    createChat: chat => ({
        id: chat.id,
        messages: chat.messages,
        participants: chat.participants,
        is_group: chat.participants.length > 1
    }),

    createMessage: (message, self) => {

        return {
            ...message,
            createdAt: Utils.getDate(message.created_at),
            isReceived: self.id !== message.author_id
        }
    }
}

export default initialState => {

    const mainReducer = (prevState = initialState, action) => {

        switch(action.type){
    
            case ActionTypes.UPDATE_IS_AUTHENTICATED: {
                return {
                    ...prevState,
                    isAuthenticated: action.isAuthenticated
                }
            }
    
            case ActionTypes.TOGGLE_HEADER_STATE: {
                return {
                    ...prevState,
                    header: action.headerState
                }
            }
    
            case ActionTypes.LOG_OUT: {
                return {
                    ...prevState,
                    isAuthenticated: false,
                    accessToken: null
                }
            }
    
            case ActionTypes.SIGN_IN: {
                return {
                    ...prevState,
                    isAuthenticated: true,
                    accessToken: action.accessToken
                }
            }

            case ActionTypes.SET_USER: {
                return {
                    ...prevState,
                    user: action.user,
                }
            }

            case ActionTypes.SET_CONTACTS: {

                let nextState = {...prevState}

                let contacts = (action.contacts && action.contacts instanceof Array ? action.contacts : [])

                for(let i = 0; i < contacts.length; i++){
                    let contactsItem = contacts[i]
                    nextState.users[contactsItem.id] = {
                        ...(nextState.users[contactsItem.id] || {}),
                        ...contactsItem,
                        is_contact: true
                    }
                }

                return nextState
            }

            case ActionTypes.ADD_CONTACT: {
                return {
                    ...prevState,
                    contacts: [
                        ...prevState.contacts,
                        action.contact
                    ].sort((a, b) => a.username.localeCompare(b.username))
                }
            }

            case ActionTypes.SET_CHATS: { // set for first time
                return {
                    ...prevState,
                    chats: action.chats
                }
            }

            case ActionTypes.SET_MESSAGES: {
                return {
                    ...prevState,
                    messages: action.messages
                }
            }

            case ActionTypes.SET_CHAT: {

                let nextState = {...prevState}
                let foundIndex = nextState.chats.findIndex(chat => chat.id === action.chat.id)

                if(foundIndex !== -1){
                    nextState.chats[foundIndex] = {
                        ...nextState.chats[foundIndex],
                        messages: action.chat.messages
                    }
                } else {
                    nextState.chats.push(StoreData.createChat(action.chat))
                }

                return nextState
            }

            case ActionTypes.UPDATE_USER: {
                
                return {
                    ...prevState,
                    users: {
                        ...prevState.user,
                        [action.user_id]: {
                            ...prevState.users[action.user_id],
                            ...action.updatedData,
                        }
                    }
                }
            }

            case ActionTypes.ADD_MESSAGE: {

                let nextChats = [...prevState.chats]
                let chatIndex = nextChats.findIndex(chat => chat.id === action.message.chat_id)

                if(chatIndex !== -1){
                    nextChats[chatIndex].messages = [
                        ...nextChats[chatIndex].messages,
                        StoreData.createMessage(action.message, prevState.user)
                    ]
                }
                
                return {
                    ...prevState,
                    chats: nextChats
                }

            }
            
            default:
                return prevState
        }
    }

    return mainReducer
}