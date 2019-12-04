
import {
    SET_TOKEN, 
    LOG_OUT,
    SET_USER,
    SET_CHATS
,} from './actions'

export const mainReducer = (state = {}, action) => {
    let nextState

    switch(action.type){
        case SET_TOKEN:
            nextState = {
                ...state,
                token: action.token
            }
        break;
        case LOG_OUT:
            nextState = {
                ...state,
                token: null
            }
        break;
        case SET_USER:
            nextState = {
                ...state,
                user: {
                    ...state.user,
                    username: action.username
                }
            }
        break;
        case SET_CHATS:
            nextState = {
                ...state,
                chats: [
                    ...state.chats,
                    action.chats
                ]
            }
        break;
        default:
            nextState = {...state}
        break;
    }

    return nextState
}