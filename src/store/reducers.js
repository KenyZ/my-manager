import {combineReducers} from 'redux'

import {
    UPDATE_IS_AUTHENTICATED,
    TOGGLE_HEADER_STATE,
    LOG_OUT,
    SIGN_IN,
    SET_USER,
    SET_CONTACTS,
    SET_CHATS,
    SET_MESSAGES
} from './actions/actions'

export default initialState => {

    const mainReducer = (prevState = initialState, action) => {

        switch(action.type){
    
            case UPDATE_IS_AUTHENTICATED: {
                return {
                    ...prevState,
                    isAuthenticated: action.isAuthenticated
                }
            }
    
            case TOGGLE_HEADER_STATE: {
                return {
                    ...prevState,
                    header: action.headerState
                }
            }
    
            case LOG_OUT: {
                return {
                    ...prevState,
                    isAuthenticated: false,
                    accessToken: null
                }
            }
    
            case SIGN_IN: {
                return {
                    ...prevState,
                    isAuthenticated: true,
                    accessToken: action.accessToken
                }
            }

            case SET_USER: {
                return {
                    ...prevState,
                    user: {
                        username: action.username,
                        avatar: action.avatar,
                    },
                }
            }

            case SET_CONTACTS: {
                return {
                    ...prevState,
                    contacts: (action.contacts && action.contacts instanceof Array ? action.contacts : []).map(c => ({
                        id: c.id,
                        username: c.username,
                        avatar: c.avatar,
                    }))
                }
            }

            case SET_CHATS: {
                return {
                    ...prevState,
                    chats: (action.chats && action.chats instanceof Array ? action.chats : []).map(c => ({
                        id: c.id,
                        participants: c.participants,
                        messages: c.lastMessage ? [{
                            id: c.lastMessage.id,
                            text: c.lastMessage.text,
                            createdAt: c.lastMessage.id,
                            author: c.lastMessage.author,
                        }] : []

                    }))
                }
            }
            
            default:
                return prevState
        }
    }

    return mainReducer
}