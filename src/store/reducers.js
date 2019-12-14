import {combineReducers} from 'redux'

import {
    UPDATE_IS_AUTHENTICATED,
    TOGGLE_HEADER_STATE,
    LOG_OUT,
    SIGN_IN,
    SET_USER
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
    
            default:
                return prevState
        }
    }

    return mainReducer
}